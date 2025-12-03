# klubr-front



## Getting started

To make it easy for you to get started with GitLab, here's a list of recommended next steps.

Already a pro? Just edit this README.md and make it your own. Want to make it easy? [Use the template at the bottom](#editing-this-readme)!

## Add your files

- [ ] [Create](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#create-a-file) or [upload](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#upload-a-file) files
- [ ] [Add files using the command line](https://docs.gitlab.com/ee/gitlab-basics/add-file.html#add-a-file-using-the-command-line) or push an existing Git repository with the following command:

```
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${PROJECT_SLUG}_postgres
```
Replace `${PROJECT_SLUG}` by `klubr`

Then connect to PgAdmin, and register a new server, filling the hostname by the network IP address.

### `Database import/export`
Before pushing Strapi/API modifications, run these 2 commands in order to export database and Strapi conf:
```
docker exec -it klubr_backend /bin/bash -c "npm run export-db-archive"
docker exec -it klubr_backend /bin/bash -c "npm run export-db"
```

When pulling  Strapi/API modifications, run this command:
```
docker exec -it klubr_backend /bin/bash -c "npm run import-db"
```
