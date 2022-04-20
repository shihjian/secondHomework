const http = require("http");
const mongoose = require("mongoose");
const Post = require("./models/post");
// 引入dotenv
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);
// 連接資料庫
mongoose
  .connect(DB)
  .then(() => {
    console.log("資料庫連線成功哦");
  })
  .catch((error) => {
    console.log(error);
  });

const requestListener = async (req, res) => {
  const headers = {
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json",
  };
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  if (req.url == "/posts" && req.method == "GET") {
    const post = await Post.find();
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        post,
      })
    );
    res.end();
  } else if (req.url == "/posts" && req.method == "POST") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        if (data.content !== undefined) {
          const newPost = await Post.create({
            name: data.name,
            content: data.content,
          });
          res.writeHead(200, headers);
          res.write(
            JSON.stringify({
              status: "success",
              data: newPost,
            })
          );
          res.end();
        } else {
          res.writeHead(400, headers);
          res.write(
            JSON.stringify({
              status: "false",
              message: "欄位未填寫正確，或無此 todo ID",
            })
          );
          res.end();
        }
      } catch (error) {
        res.writeHead(400, headers);
        res.write(
          JSON.stringify({
            status: "false",
            message: error,
          })
        );
        res.end();
      }
    });
  } else if (req.url.startsWith("/posts/") && req.method == "DELETE") {
    const id = req.url.split("/").pop();
    await Post.findByIdAndDelete(id);
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        data: null,
      })
    );
    res.end();
  } else if (req.url.startsWith("/posts/") && req.method == "PATH") {
    req.on("end", async () => {
      try {
        //提取輸入內容
        const data = JSON.parse(body);
        //抓取ID
        const id = req.url.split("/").pop();
        await Post.findByIdAndUpdate(id, {
          $set: {
            name: data.name,
            content: data.content,
          },
        });
        res.writeHead(200, headers);
        res.write(
          JSON.stringify({
            status: "success",
            data: null,
          })
        );
        res.end();
      } catch (error) {
        res.writeHead(400, headers);
        res.write(
          JSON.stringify({
            status: "false",
            message: error,
          })
        );
        res.end();
      }
    });
  } else if (req.method == "OPTIONS") {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(
      JSON.stringify({
        status: "false",
        message: "無此網站路由",
      })
    );
    res.end();
  }
};
const server = http.createServer(requestListener);
server.listen(process.env.PORT);
