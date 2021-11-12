let fs = require('fs');
let http = require('http')
const path = require("path")

const dirPath = 'E:/calls/'
const endpoint = 'http://192.168.1.250:6373/mamute-info.cgi?action=file&key=12345678900&id=1634928197.416059'
const maxSize = 5.0
const fileName = `${Math.random(10)}.gsm`

function download(endpoint, filePath, callback) {
  let file = fs.createWriteStream(filePath)

  http.get(endpoint, function(response) {
    response.pipe(file)
    file.on('finish', function() { file.close(callback)  })
  })
    .on('error', function(error) {
      // delete the file async
      fs.unlink(filePath); 
      if (callback)
        cb(error.message);
    })
};

// SIZE OF FOLDER
function getAllFiles(dirPath) {
  let files = fs.readdirSync(dirPath)
  arrayOfFiles = []

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(dirPath, file))
    }
  })

  return arrayOfFiles
}

function getTotalSize(dirPath) {
  const arrayOfFiles = getAllFiles(dirPath)
  let totalSize = 0

  arrayOfFiles.forEach(function(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        totalSize += fs.statSync(filePath).size
      }
    } catch (error) {
      console.log('error')
    }
  })

  return parseFloat((totalSize/1024)/1024).toFixed(4)
}

// // TO DELETE THE OLDEST FILE
const deleteHandler = async () => {
  
    let dates = []
    let dirSize = getTotalSize(dirPath)
    let files = fs.readdirSync(dirPath)
    
    //array with each string containing the birthtime and name of all files in the folder
    files.forEach(file => {
        if (file) {
            let date = fs.statSync(dirPath + file).birthtime
            dates.push(`${date},${file}`)
        }
    })

    // // array ordered by crescent date
    const orderedDates = dates.sort(function(lastDate, firstDate) {
        return Date.parse(lastDate.split(',', 1)[0]) - Date.parse(firstDate.split(',', 1)[0]);
    })

    // //get the name of file which will be deleted
    const fileToDeletePath =  orderedDates[0] ? orderedDates[0].substring(orderedDates[0].lastIndexOf(",")+1) : ''

    if (dirSize > maxSize && fileToDeletePath) {
      fs.unlink(dirPath + fileToDeletePath, (err) => {
        if (err)
          throw err
        console.log(fileToDeletePath + ' was deleted');
        deleteHandler()
      })
    }
}

const downloadHandler = () => {
    deleteHandler()
    download(endpoint, dirPath + fileName)
}

downloadHandler()