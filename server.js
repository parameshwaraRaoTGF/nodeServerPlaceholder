const express = require('express');

var cors = require('cors');
const { check, validationResult } = require('express-validator');

let { promisify } = require('util');

const { pipeline } = require('stream/promises');

//formidable to file uplod
let formidable = require('formidable');

//file handling imports
let fs = require("fs");
let zlib = require('zlib');

const archiver = require("archiver");

let _http = require('http');

const app = express();

//fire base imports
let { initializeApp } = require('firebase/app');
let { getStorage, ref, listAll, getStream, uploadBytes , deleteObject } = require('firebase/storage');


const config = require('config');
const firebaseConfigObject = config.get('firebase');



//Init Middleware
app.use(express.json({ extended: false }));
//enable cors
app.use(cors());

const path = require('path');

app.use(express.static(path.join(__dirname, 'raomeanapp')));

app.get('*', (req, res) =>{
    res.sendFile(`${__dirname}/raomeanapp/index.html`);
} );




const PORT = process.env.PORT || 5000;

//crate the app and bind it to port
let httpServer = _http.createServer(app).listen(PORT, () => console.log(`Listening on port ${PORT}`));

//initialize firebaseapp 
let firebaseAppRef = initializeApp(firebaseConfigObject);
//create firebase storage Ref
let firebaseStorageRef = getStorage(firebaseAppRef);

//assign folder name
let firebaseFolderName = config.get('firebaseStorageFolderName');


/**
 * This is used to list all files present in firebase storage
 */

app.post('/fileList', [
    check('userPath', 'please send file basePath!!').not().isEmpty()
],
    async (req, res) => {

        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            //extract base path

            let { body: { userPath } } = req;

            //set the folder name

            let foldername = `${firebaseFolderName}${userPath}`;

            //create firebase reference

            let listRef = ref(firebaseStorageRef, foldername);

            //use list all to get the ref name

            let allFiles = await listAll(listRef);

            let { items } = allFiles;

            //check if files are empty

            if (items.length < 0) {
                return res.status(204).json({ files: [] });
            }

            let filesPath = items.map((fileboject) => {
                return fileboject._location;
            });



            return res.status(200).json({ files: filesPath });

        }
        catch (err) {

            return res.status(500).json({ error: err });

        }
    });


    /**
     * This is used to compress and download
     */

app.post('/compressedFileListDownload', [
    check('userPath', 'please send file basePath!!').not().isEmpty(),
    check('compressedFilename', 'please send compressedFileName!!').not().isEmpty()
],
    async (req, res) => {

        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            let { body: { userPath, compressedFilename } } = req;

            let foldername = `${firebaseFolderName}${userPath}`;

            let listRef = ref(firebaseStorageRef, foldername);

            //get all file paths using list all

            let allFiles = await listAll(listRef);

            let { items } = allFiles;

            if (items.length < 0) {
                return res.status(204).json({ files: [] });
            }
            //create output compressed file stream

            let outputStream = fs.createWriteStream('fileProcess/compressedFile.zip');

            //create archive 

            let archive = archiver('zip', {
                zlib: { level: 9 }
            });

            //pipe the outstream to archive
            archive.pipe(outputStream);

            let file = items.map((fileboject) => {

                //get the file name
                let filePath = `${fileboject._location.path_}`;

                let fileName = filePath.split('/').pop();

                //create reference
                let firebaseReference = ref(firebaseStorageRef, filePath);

                //get the stream
                let file = getStream(firebaseReference);

                //append the firebae file streams to zip archive

                archive.append(file, { name: fileName });


            });

            res.attachment(`${compressedFilename}.zip`);

            // pipe the zip to response
            archive.pipe(res);

            //complete the archive

            await archive.finalize();

            //set status code

            res.status(200);

            //return response


            return res;

        }
        catch (err) {

            return res.status(500).json({ error: err });

        }
    });


    /**
     * takes form file as input and uploads it GCP firebase storage
     */

app.post('/uploadFile',
    async (req, res) => {

        try {


            if (!req.get('userPath')) {
                return res.status(400).json({ error: 'send basefilepath' });
            }

            //start a for to handle incoming file

            let form = new formidable.IncomingForm({
                multiples: true,
                keepExtensions: true
            });

            let uploadFile = await form.parse(req);

            let [Feilds, Files] = uploadFile;

            //get the user name i.e folder name from the header

            let folderDirectory = req.get('userPath');

            let { samplefile } = Files;

            if (samplefile.length > 0) {
                for (let fileobject of samplefile) {

                    //extract original filename and file path

                    let { originalFilename, filepath} = fileobject;                   

                    //set file object

                    let fileobjectRef = fileobject;
                    // Create a file readable stream
                    let readerStream = fs.readFileSync(filepath);
                    //set filepath
                    let uplaodedFilePath = `${firebaseFolderName}/${folderDirectory}/${originalFilename}`;

                    //create firebase file ref
                    let uploadRef = ref(firebaseStorageRef, uplaodedFilePath);

                    //upload to firebase

                    let uploadStats = await uploadBytes(uploadRef, readerStream);
                }


            }

            return res.status(200).json({ message: "file uploaded", uploaded: true });

        }
        catch (err) {

            return res.status(500).json({ error: err });

        }
    });

    

    //call below to delete the files in GCP Firbasestore

    //pass the user name as userpath in req body


    app.delete('/deleteFile',[
        check('filesToDelete','send files to delete in array').not().isEmpty(),
        check('userPath', 'send the file directory!!').not().isEmpty()
    ],
    async (req, res) => {

        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
           
            //start a for to handle incoming file

            let { body: { filesToDelete , userPath } } = req;          
            
            //container to hold status
            let deleteFileStatus = [];

            if (filesToDelete.length > 0) {
                for (let filename of filesToDelete) {

                                      
                    //set filepath
                    let uplaodedFilePath = `${firebaseFolderName}/${userPath}/${filename}`;

                    //create firebase file ref
                    let deleteFileRef = ref(firebaseStorageRef, uplaodedFilePath);

                    //upload to firebase

                    let deletedFileStatus = await deleteObject(deleteFileRef);
                    deleteFileStatus.push(deletedFileStatus);
                }
            }

            return res.status(200).json({ message: "file uploaded", fileDeletedStatus: deleteFileStatus });

        }
        catch (err) {

            return res.status(500).json({ error: err });

        }
    });