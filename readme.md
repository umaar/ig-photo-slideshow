
### IG Photo Viewer

#### To View the web app

```sh
npm run migrate-db-dev
npm run seed-db-dev
npm start
```

#### Download more images (step 1)

```sh
npm run download-images
```

#### For orphan images (image files which exist, but do not have a corresponding DB record), this script will add the relevant DB records (step 2)

```sh
npm run add-images-file-names-to-db
```

#### Recognise the images (step 3)

```
npm start

# open in browser
http://localhost:3000/perform-face-detection
```