
# IG Photo Viewer

## To start on dev

```sh
npm run migrate-db-dev
npm run seed-db-dev
npm start
```

## Download more images

```sh
npm run download-images
```

# For orphan images (image files which exist, but do not have a corresponding DB record), this script will add the relevant DB records

```sh
npm run add-images-file-names-to-db
```