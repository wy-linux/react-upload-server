### Node + Express + Typescript 大文件上传组件的后端接口
- ES Module + Typescript编码，使用ts-node编译后启动
```shell
1. npm install  下载相关依赖
2. npm run dev  启动接口
```
###### 查找已经上传的所有切片
```javascript
let tempDir = path.resolve(TEMP_DIR, filename)
uploadList = await fs.readdir(tempDir)
uploadList = await Promise.all(uploadList.map(async(filename: string) => {
    //fs.stat获取切片大小并与切片名称一起返回前端
    let stat = await fs.stat(path.resolve(tempDir, filename))
    return {
        filename,
        size: stat.size
    }
}))
```
###### 合并所有切片
```javascript
//对切片列表进行排序
chunkFiles.sort((a, b) => Number(a.split('-')[1]) - Number(b.split('-')[1]))
await Promise.all(chunkFiles.map((chunkFile: string, index: number) => {
    //可读流 -> 可写流并发写入合并
    return pipeStream(
        path.resolve(chunksDir, chunkFile),
        fs.createWriteStream(filePath, {
            start: index * size
            // flags: 'a'：不行，文件流异步操作
        })
    )
}))
```
