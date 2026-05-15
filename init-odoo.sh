#!/bin/bash
set -e

DB_NAME="clicktochefDB"
ADMIN_EMAIL="clicktochef@clicktochef.com"
ADMIN_PASSWORD="clicktochef"
FLAG_FILE="/var/lib/odoo/.initialized"

# Arreglar permisos del volumen montado (corre como root)
echo "[Init] Corrigiendo permisos en /var/lib/odoo..."
chown -R odoo:odoo /var/lib/odoo
chmod -R u+rwX /var/lib/odoo

if [ ! -f "$FLAG_FILE" ]; then
    echo "[Init] Primera ejecucion: creando base de datos e instalando modulos..."
    runuser -u odoo -- odoo -c /etc/odoo/odoo.conf -i stock,point_of_sale,l10n_es --without-demo=all --stop-after-init

    echo "[Init] Cargando traduccion al español..."
    runuser -u odoo -- odoo -c /etc/odoo/odoo.conf -d "$DB_NAME" --i18n-import=/dev/null --language=es_ES --stop-after-init 2>/dev/null || true
    runuser -u odoo -- odoo -c /etc/odoo/odoo.conf -d "$DB_NAME" --load-language=es_ES --stop-after-init

    echo "[Init] Configurando usuario admin, localizacion española e impuestos..."
    runuser -u odoo -- odoo shell -c /etc/odoo/odoo.conf -d "$DB_NAME" --no-http <<EOF
import base64, os

# Activar idioma español y establecerlo como idioma por defecto del sistema
env['res.lang']._activate_lang('es_ES')
lang = env['res.lang'].search([('code', '=', 'es_ES')], limit=1)
if lang:
    lang.active = True

# Establecer es_ES como idioma por defecto en los parámetros del sistema
env['ir.config_parameter'].sudo().set_param('lang', 'es_ES')

# Configurar compañía: nombre, país España, moneda Euro y zona horaria
company = env.company
company.name = 'ClickToChef'
company.country_id = env.ref('base.es')
company.currency_id = env.ref('base.EUR')
company.resource_calendar_id.tz = 'Europe/Madrid'
if os.path.exists('/logo.png'):
    with open('/logo.png', 'rb') as f:
        company.logo = base64.b64encode(f.read()).decode()
    print('[Init] Logo de empresa configurado')

# Configurar usuario admin
u = env['res.users'].search([('login', '=', 'admin')], limit=1)
if u:
    u.write({'login': '$ADMIN_EMAIL', 'email': '$ADMIN_EMAIL', 'lang': 'es_ES', 'tz': 'Europe/Madrid'})
    u._change_password('$ADMIN_PASSWORD')
    print('[Init] Usuario configurado: $ADMIN_EMAIL')

# Forzar idioma español en todos los usuarios existentes
for user in env['res.users'].search([]):
    user.lang = 'es_ES'

# Crear configuracion del TPV
pos_config = env['pos.config'].search([], limit=1)
if not pos_config:
    pos_config = env['pos.config'].create({'name': 'ClickToChef TPV'})
    print('[Init] Configuracion TPV creada')

env.cr.commit()
print('[Init] Configuracion completada: idioma es_ES, pais España, moneda EUR, TPV creado')
EOF

    touch "$FLAG_FILE"
    echo "[Init] Inicializacion completada."
else
    echo "[Init] Sistema ya inicializado, arrancando directamente..."
fi

echo "[Init] Iniciando Odoo..."
exec runuser -u odoo -- odoo -c /etc/odoo/odoo.conf
