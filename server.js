express= require("express")
mysql = require("mysql")
bodyParser = require("body-parser")


const port = 5000
const sql_host = 'localhost'
const sql_user = 'root'
const sql_password = ''
const sql_database = 'translations'

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
var connectionDB = mysql.createConnection({
    host: sql_host,
    user: sql_user,
    password: sql_password,
    database: sql_database
})

connectionDB.connect(function(err){
    if(err) throw err;
    console.log("Database connected...")
    
})
async function mappings (string){
    wordList = string.split(' ')
    mappedList = []
    const promises = []
        for (const word of wordList){
            const sql = 'SELECT * FROM wordmaps WHERE engWord = "' + word + '"'
            const promise = new Promise((resolve,reject) => {
                connectionDB.query(sql,(err,res)=>{
                    if(err) {
                        reject(err)
                    } else if(res.length){
                        const mappedWord = JSON.parse(JSON.stringify(res))[0]["nepWord1"]
                        resolve(mappedWord)
                    }
                    else{
                        resolve(word)
                    }
                })
                
            })
            promises.push(promise) 
        }

    return Promise.all(promises).then((mappedList) =>{
        return mappedList;
    }).catch((error) =>{
        console.log("Error ",error)
        return [];
    })
}

app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/webui.html')
})
app.post('/',async(req,res)=>{
    sentence = req.body.words
    new_words =await mappings(sentence)
    console.log(new_words)
    res.sendStatus(200)
})
app.listen(port,"localhost",()=>{
    console.log('Server running')
})