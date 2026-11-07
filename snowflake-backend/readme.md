/* TO CREATE ADMIN USER */

To create an admin user, follow the below steps:
1. change to the corresponding backend repo
2. execute the below code

ADMIN_NAME="Snowpify Admin" \
ADMIN_EMAIL="admin@example.com" \
ADMIN_PASSWORD="Admin@1” \
node scripts/createAdmin.js