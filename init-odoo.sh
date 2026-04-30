#!/bin/bash
set -e

DB_NAME="clicktochefDB"
ADMIN_EMAIL="clicktochef@clicktochef.com"
ADMIN_PASSWORD="clicktochef"
FLAG_FILE="/var/lib/odoo/.initialized"

if [ ! -f "$FLAG_FILE" ]; then
    echo "[Init] Primera ejecucion: creando base de datos e instalando modulos..."
    odoo -c /etc/odoo/odoo.conf -i stock,point_of_sale,account,l10n_es --without-demo=all --stop-after-init

    echo "[Init] Configurando usuario admin y localizacion española..."
    odoo shell -c /etc/odoo/odoo.conf -d "$DB_NAME" --no-http << EOF
import base64, os

# Activar idioma español
env['res.lang']._activate_lang('es_ES')

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

env.cr.commit()
print('[Init] Localizacion española configurada: idioma es_ES, pais España, moneda EUR')
EOF

    touch "$FLAG_FILE"
    echo "[Init] Inicializacion completada."
else
    echo "[Init] Sistema ya inicializado, arrancando directamente..."
fi

echo "[Init] Iniciando Odoo..."
exec odoo -c /etc/odoo/odoo.conf
