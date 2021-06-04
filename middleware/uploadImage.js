const fs = require('fs')

module.exports = async (req, res, next) => {
    try {
        if(!req.files || Object.keys(req.files).length === 0)
            return res.status(400).json({msg: "No files were uploaded."})
        const file = req.files.file

        console.log(file)

        if(file.size > 1024*1024){
            removeTmp(file.tempfilePath)
            return res.status(400).json({msg: "Size too large."})

        } //!Mb

        next()
    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
}

const removeTmp = (path) => {
    fs.unlink(path, err =>{
        if(err) throw err
    })
}