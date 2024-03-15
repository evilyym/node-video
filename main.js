/*
 * @Author: yym
 * @Date: 2024-03-13 17:57:49
 * @LastEditTime: 2024-03-15 17:54:25
 */
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));


// 递归获取指定文件夹下所有文件
async function getAllFiles(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map(async (dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getAllFiles(res) : res;
    })
  );
  return [].concat(...files);
}

// 格式化文件信息为树状结构
function formatTree(files) {
  const tree = {};
  for (let file of files) {
    const { path, level, parent } = file;
    let current = tree;
    for (let i = 0; i <= level; i++) {
      const segment = path.slice(0, path.indexOf('/', i === 0 ? 1 : i + 1));
      if (!current[segment]) {
        current[segment] = i < level ? {} : { path: segment, parent };
      }
      current = current[segment];
    }
  }
  console.log(tree[''], null, 2);
  return JSON.stringify(tree[''], null, 2);
}

// 定义POST接口
app.post('/list-files', async (req, res) => {
  try {
    const { folderPath } = req.body;
    const folderPathResolved = path.resolve(folderPath || './'); // 获取绝对路径
    const allFiles = await getAllFiles(folderPathResolved);
    // const treeData = formatTree(allFiles);
    // 将生成的JSON数据保存到文件中
    // await fs.writeFile(`file-tree-${Date.now()}.json`, treeData);

    // 确保返回的数据是JSON格式
    res.setHeader('Content-Type', 'application/json');
    // res.send(treeData);
    res.send(allFiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while listing the files.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});