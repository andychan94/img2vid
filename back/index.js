const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const videoshow = require('videoshow')
const ffmpeg = require('fluent-ffmpeg');
const os = require('os')

// Windows OS paths to ffmpeg
let ffmpegBinPath = path.join(__dirname, '/FFmpeg/bin/ffmpeg.exe')
let ffprobePath = path.join(__dirname, '/FFmpeg/bin/ffprobe.exe')

// TODO confirm if the following paths work on linux OS
if (os.platform() === 'darwin') {
    // macOS paths
    ffmpegBinPath = '/usr/local/bin/ffmpeg'
    ffprobePath = '/usr/local/bin/ffprobe'
}

ffmpeg.setFfmpegPath(ffmpegBinPath);
ffmpeg.setFfprobePath(ffprobePath);

const app = express()
const port = 8080

const videoOptions = {
    fps: 125,
    loop: 0.5, // time (seconds) per slide
    transition: false,
    disableFadeOut: true,
    videoBitrate: 1024,
    videoCodec: 'libx264',
    size: '640x?',
    audioBitrate: '128k',
    audioChannels: 2,
    format: 'mp4',
    pixelFormat: 'yuv420p'
}

const UPLOAD_FILES_DIR = "./uploads"
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, UPLOAD_FILES_DIR)
    },

    filename(req, file = {}, cb) {
        file.mimetype = "audio/webm"
        const {originalname} = file
        const fileExtension = (originalname.match(/\.+[\S]+$/) || [])[0]
        cb(null, `${file.fieldname}${Date.now()}${fileExtension}`)
    }
})
const upload = multer({storage})

app.post("/multiplefiles", upload.array('slideImg', 5),
    function (req, res) {

    let images = []

    req.files.forEach(element =>
        images.push(element.path)
    )

    videoshow(images, videoOptions)
        .save('video.mp4')
        .on('start', function (command) {
            console.log('ffmpeg process started:', command)
        })
        .on('error', function (err, stdout, stderr) {
            console.error('Error:', err)
            console.error('ffmpeg stderr:', stderr)
        })
        .on('end', function (output) {
            console.error('Video created in:', output)

            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

            const filePath = path.join(__dirname, output)
            const stat = fs.statSync(filePath)

            res.writeHead(200, {
                'Content-Type': 'video/mp4',
                'Content-Length': stat.size
            })

            const readStream = fs.createReadStream(filePath)
            readStream.pipe(res)

        })
})

app.get("/video", function (req, res) {
    const range = req.headers.range
    if (!range) {
        res.status(400).send("Requires Range header")
    }

    const videoPath = "video.mp4"
    const videoSize = fs.statSync("video.mp4").size

    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 6 // 1MB
    const start = Number(range.replace(/\D/g, ""))
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1)

    const contentLength = end - start + 1
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    }

    res.writeHead(206, headers)

    const videoStream = fs.createReadStream(videoPath, {start, end})

    videoStream.pipe(res)
})

app.listen(port, () => console.log(`Slideshow app listening on port ${port}!`))