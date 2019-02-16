
## IG Photo Viewer

This project downloads images, and then creates an audio-reactive slideshow from them.

#### Inspiration

This [YouTube Video](https://www.youtube.com/watch?v=XqwbqxzsA2g)

#### Configure

- The `downloadsDirectory` property in `config/development.json`.

#### Install deps

- `npm i`

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

You should now have images in your `downloadsDirectory` folder (which is specified in the config file).

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

### Optional: Add music

You can add music to your copy of this repo to see face changes according to beats in the music.

- Audio should live in `src/client/audio`
- Update the `on-audio-step.js` file to reference your newly added audio tracks

#### Optional: Rename files which include query strings

A bug in the image downloader scripts means some images are downloaded with query strings, e.g. `a7_89698--10845893576_786_789_n.jpg?some-query-string`. Running this terminal command will fix that:

```sh
ls | sed 's/\(.*\)\(?.*\)/mv \"&\" \"\1\"/' | bash
```

#### Optional: Rename files to match the original naming structure

```js
fs.readdirSync('.').filter(file => file.includes('.png')).map(file => {
    const nameWithoutExtension = file.split('.')[0]
    return {
        originalName: `${process.cwd()}/${file}`,
        newName: `${process.cwd()}/ffhq-${nameWithoutExtension}--${nameWithoutExtension}.png`
    }
}).map(({originalName, newName}) => fs.renameSync(originalName, newName));
```
