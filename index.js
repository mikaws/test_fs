import fs from 'fs'
import fsPromises from 'fs/promises'
import https from 'https'
import path from 'path'
import './sortByMethod.js'

//exceções de pasta ao deletar
//extensões

const randomNumber = Math.floor(Math.random()*1000)
const dirPath = 'tmp'
const imgUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/132.png'
const fileName = `shiny-ditto${randomNumber}.png`
const maxDirSize = 0.001 // in MB

const openDir = async dir => {
    try {
        // check if the directory exists opening it
        let checkDir = await fsPromises.opendir(dir)
        await checkDir.close()
        return true
    } catch (error) {
        console.warn('Directory not found')
        return false
    }
}

const createDir = async dir => {
    try {
        await fsPromises.mkdir(dir)
        console.log("Folder 'tmp' was created")
    } catch (error) {
        console.error('Failed to attempt create a new dir')
    }
}

export const getFileStatus = async (dest) => {
    try {
        let fileStatus = await fsPromises.stat(dest)
        return fileStatus
    } catch (error) {
        console.error(error.message)
    }
}

export const getAllFiles = async (dirPath, filesArr) => {
    try {
        let arrayOfFiles = filesArr ? filesArr : []

        let files = await fsPromises.readdir(dirPath)
        for (let file of files) {
            let dest = path.join(dirPath, file)
            let fileStatus = await getFileStatus(dest)
            
            if (fileStatus.isDirectory())
                arrayOfFiles = await getAllFiles(dest, arrayOfFiles)
            else{
                arrayOfFiles.push(({
                    'path' : dest,
                    'birthtime' : fileStatus.birthtime.toString(),
                    'size' : fileStatus.size
                }))
            }
        }
        return arrayOfFiles
    } catch (error) {
        console.error(error.message)
    }
}

// SIZE OF MAIN FOLDER
export const getDirSize = async dirPath => {
    let files = await getAllFiles(dirPath)
    let folderSize = 0.0

    for (let file of files) {
        folderSize += file.size
    }
    // converting to MB
    folderSize = ((folderSize/1024)/1024).toFixed(4)


    return folderSize
}

export const deleteFile = async filePath => {
    try {
        await fsPromises.unlink(filePath)
    } catch (error) {
        console.error('Failed to delete the corrupted file')
    }
}

// TO DELETE THE OLDEST FILE
export const deleteHandler = async (dirPath) => {
    let files = await getAllFiles(dirPath)
    let dirSize = await getDirSize(dirPath)
    if (files.length <= 0)
        return
    console.log(dirSize)
    // array ordered by crescent date
    let filesOrderedByDate = files.sortBy(function(o) { return o.birthtime })
    let oldestFile = filesOrderedByDate[0].path
    if (dirSize > maxDirSize) {
        await deleteFile(oldestFile)
        console.log(oldestFile + ' was deleted')
        await deleteHandler(dirPath)
    }
}

const downloadFile = async (url, dirPath, fileName) => {
    let dest = path.join(dirPath, fileName)
    let file = fs.createWriteStream(dest)

    https.get(url, async res => {
        if (res.statusCode !== 200) {
            // deletes the incoming file if isn't a sucess request
            await deleteFile(dest)
            return console.warn("File wasn't created due to request issues")
        }
        // process the file
        res.pipe(file)
        file.on('finish', () => { 
            file.close(() => {
                console.log(`File ${fileName} was successfully created`)
            })
        }).on('error', async err => {
            // deletes the incoming file if an error occurs
            await deleteFile(dest)
            console.error(err.message);
        })
    })
}

const checkDir = async (dirPath) => {
    // check if the folder exists
    let checkedDir = await openDir(dirPath)

    // else creates one
    checkedDir || await createDir(dirPath)
}

await checkDir(dirPath)
await deleteHandler(dirPath)
await downloadFile(imgUrl, dirPath, fileName)