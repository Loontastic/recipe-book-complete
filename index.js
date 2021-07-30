const server = require("./server");
const persist = require("./persist");

const port = process.argv[2]||process.env.PORT ||8080;

persist(()=>{
    server.listen(port, ()=>{
        console.log(`Code School 2021 Recipe Book App Running on port ${port}`);
    })
})