# common-product
It is a common service to manage and search product.  It supports multi-tenant and can be used by multiple projects at the same time.
# dependency
1. It depends on common-iam module for authentication and authorization.
2. Install elasticsearch for product index and search
# dev env set up
1. Install mysql server version 5.6+
2. Install nodejs version 4.3.1+
3. Install npm 2.15.10+
4. set up db
    * db/script/_create_schema.sql
    * db/script/_create_table.sql
    * db/script/seeddata.sql
5. update dev settings: conf_dev.json
6. DEV build: ./build_dev.sh
7. start service
    * node main.js -p 8080
8. api doc
    * http://localhost:8080/apidocs/index.html

# staging env
1. api doc
    * http://123.56.234.68:16668/apidocs/index.html
2. test tenant
    * cm
    * username/password: cmadmin/cmadmin