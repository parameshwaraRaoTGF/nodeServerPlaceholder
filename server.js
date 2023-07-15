const express = require('express');

var cors = require('cors');
const { check, validationResult } = require('express-validator');

let { promisify } = require('util');

const { pipeline } = require('stream/promises');

//file handling imports
let fs = require("fs");
let zlib = require('zlib');

const archiver = require("archiver");

let _http = require('http');

const app = express();

//fire base imports
let { initializeApp } = require('firebase/app');
let { getStorage } = require('firebase/storage');

const config = require('config');
const firebaseConfigObject = config.get('firebase');

let { ref, listAll , getStream  } = require('firebase/storage');


//Init Middleware
app.use(express.json({ extended: false }));
//enable cors
app.use(cors());

app.get('/', (req, res) => res.send(`file zipper app is running!`));




const PORT = process.env.PORT || 5000;

//crate the app and bind it to port
let httpServer = _http.createServer(app).listen(PORT, () => console.log(`Listening on port ${PORT}`));

//initialize firebaseapp 
let firebaseAppRef = initializeApp(firebaseConfigObject);
//create firebase storage Ref
let firebaseStorageRef = getStorage(firebaseAppRef);

//assign folder name
let firebaseFolderName = config.get('firebaseStorageFolderName');

app.post('/fileList', [
    check('basePath', 'please send file basePath!!').not().isEmpty()
],
    async (req, res) => {

        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
              return res.status(400).json({ errors: errors.array() });
            }

            //extract base path

            let {body:{basePath}} = req;

            //set the folder name

            let foldername = `${firebaseFolderName}${basePath}`;

            //create firebase reference

            let listRef = ref(firebaseStorageRef, foldername);

            //use list all to get the ref name

            let allFiles = await listAll(listRef);

            let { items } = allFiles;

            //check if files are empty

            if(items.length < 0){
                return res.status(204).json({ files: [] });
            }

            let filesPath = items.map((fileboject)=>{
                return fileboject._location;
            });



            return res.status(200).json({ files: filesPath });

        }
        catch (err) {

            return res.status(500).json({ error: err });

        }
    });


    app.post('/fileListDownload', [
        check('basePath', 'please send file basePath!!').not().isEmpty()
    ],
        async (req, res) => {
    
            try {
    
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                  return res.status(400).json({ errors: errors.array() });
                }
    
                let {body:{basePath}} = req;
    
                let foldername = `${firebaseFolderName}${basePath}`;
    
                let listRef = ref(firebaseStorageRef, foldername);

                //get all file paths using list all
    
                let allFiles = await listAll(listRef);
    
                let { items } = allFiles;
    
                if(items.length < 0){
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

                let file = items.map((fileboject)=>{

                    //get the file name
                    let filePath = `${fileboject._location.path_}`;

                    let fileName = filePath.split('/').pop();               

                    //create reference
                    let firebaseReference = ref(firebaseStorageRef, filePath);

                    //get the stream
                    let file = getStream(firebaseReference);

                    //append the firebae file streams to zip archive

                    archive.append(file,{name:fileName});


                });

                res.attachment('compressedFile.zip');

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