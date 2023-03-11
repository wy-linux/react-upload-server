import path from 'path'
import fs, {WriteStream} from 'fs-extra'
// const DEFAULT_SIZE = 1024 * 1024 * 100
const DEFAULT_SIZE = 1024 * 1024 * 10
export const TEMP_DIR = path.resolve(__dirname, 'temp')
export const PUBLIC_DIR = path.resolve(__dirname, 'public')
export const splitChunks =async (filename: string, size: number = DEFAULT_SIZE) => {
    let filePath = path.resolve(PUBLIC_DIR, filename)
    const chunksDir = path.resolve(TEMP_DIR, filename)
    await fs.mkdirp(chunksDir)
    let content = await fs.readFile(filePath)
    let i = 0, current = 0, length = content.length
    while(current < length) {
        await fs.writeFile(
            path.resolve(chunksDir, filename + '-' + i),
            content.slice(current, current + size)
        )
        i++
        current += size
    }
}
const pipeStream = (filePath: string, ws: WriteStream) => new Promise((resolve: any) => {
    let rs = fs.createReadStream(filePath)
    rs.on('error', () => {
        ws.close()
    })
    rs.on('end', async () => {
        rs.close()
        await fs.unlink(filePath)
        resolve()
    })
    rs.pipe(ws)
})
export const mergeChunks = async (filename: string, size: number = DEFAULT_SIZE) => {
    const filePath = path.resolve(PUBLIC_DIR, filename)
    const chunksDir = path.resolve(TEMP_DIR, filename)
    const chunkFiles = await fs.readdir(chunksDir)
    chunkFiles.sort((a, b) => Number(a.split('-')[1]) - Number(b.split('-')[1]))
    await Promise.all(chunkFiles.map((chunkFile: string, index: number) => {
        return pipeStream(
            path.resolve(chunksDir, chunkFile),
            fs.createWriteStream(filePath, {
                start: index * size
                // flags: 'a'：不行，文件流异步操作
            })
        )
    }))
    await fs.rmdir(chunksDir)
}
// splitChunks('wangyu.jpg')
// mergeChunks('wangyu.jpg')