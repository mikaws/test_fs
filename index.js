let fs = require('fs');
let http = require('http')
const path = require("path")

// const download = function(url, dest, cb) {
//     let file = fs.createWriteStream(dest);
//     let request = http.get(url, function(response) {
//       response.pipe(file);
//       file.on('finish', function() {
//         file.end();  // close() is async, call cb after close completes.
//       });
//     }).on('error', function(err) { // Handle errors
//         console.log(dest.substring(dest.lastIndexOf("/")+1))
//     //   fs.unlink(dest.substring()); // Delete the file async. (But we don't check the result)
//       if (cb) cb(err.message);
//     });
// };

// SIZE OF FOLDER
const getAllFiles = function(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(dirPath, file))
    }
  })

  return arrayOfFiles
}

const getTotalSize = function(directoryPath) {
  const arrayOfFiles = getAllFiles(directoryPath)

  let totalSize = 0

  arrayOfFiles.forEach(function(filePath) {
    totalSize += fs.statSync(filePath).size
  })

  return parseFloat((totalSize/1024)/1024).toFixed(4)
}

let dates = []

// // TO DELETE THE OLDEST FILE
const deleteHandler = () => {
    //array with each string containing the birthtime and name of all files in the folder
    files.forEach(file => {
        let date = fs.statSync('E://calls/' + file).birthtime
        dates.push(`${date},${file}`)
    });

    //array ordered by crescent date
    const orderedDates = dates.sort(function(lastDate, firstDate) {
        return Date.parse(lastDate.split(',', 1)[0]) - Date.parse(firstDate.split(',', 1)[0]);
    });

    //get the name of file which will be deleted
    const fileToDelete = orderedDates[0].substring(orderedDates[0].lastIndexOf(",")+1)

    fs.unlink('E://calls/' + fileToDelete, (err) => {
        if (err) {throw err};
            console.log(fileToDelete + ' was deleted');
    });
}

const downloadHandler = () => {
    
    // const res = download('http://192.168.1.250:6373/mamute-info.cgi?action=file&key=12345678900&id=1634928197.416059', 'E:/calls/'+ Math.random(10) + '.gsm')
    
    let totalSize = getTotalSize("E://calls/")
    if (totalSize > 6.0) {
        deleteHandler()
    }
}


downloadHandler()