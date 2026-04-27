#!/bin/bash
set -e

DB_NAME="clicktochefDB"
ADMIN_EMAIL="clicktochef@clicktochef.com"
ADMIN_PASSWORD="clicktochef"

echo "[Init] Comprobando si la base de datos existe..."
DB_EXISTS=$(python3 -c "
import psycopg2, sys
try:
    conn = psycopg2.connect(host='db_odoo', dbname='postgres', user='odoo', password='odoo')
    cur = conn.cursor()
    cur.execute(\"SELECT 1 FROM pg_database WHERE datname='$DB_NAME'\")
    print('yes' if cur.fetchone() else 'no')
    conn.close()
except Exception as e:
    print('no')
" 2>/dev/null)

if [ "$DB_EXISTS" != "yes" ]; then
    echo "[Init] Creando base de datos e instalando modulos..."
    odoo -c /etc/odoo/odoo.conf -i stock,point_of_sale --without-demo=all --stop-after-init

    echo "[Init] Configurando usuario admin..."
    odoo shell -c /etc/odoo/odoo.conf -d "$DB_NAME" --no-http << EOF
u = env['res.users'].search([('login', '=', 'admin')], limit=1)
if u:
    u.write({'login': '$ADMIN_EMAIL', 'email': '$ADMIN_EMAIL'})
    u._change_password('$ADMIN_PASSWORD')
    env.cr.commit()
    print('[Init] Usuario configurado: $ADMIN_EMAIL')
EOF
else
    echo "[Init] La base de datos ya existe, omitiendo inicializacion."
fi

echo "[Init] Iniciando Odoo..."
exec odoo -c /etc/odoo/odoo.conf
