require('dotenv').config();
const express=require('express');
const cors=require('cors');
const pg = require('pg');
const app = express();
// const methodOverride=require('method-override');
const methodOverride=require('method-override');

const PORT = process.env.PORT || 8000;

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error',(err)=>console.log(err));

app.use(express.urlencoded({extended:true}));
app.use(express.static('./public'));
// app.use(methodOverride('_method'));
app.use(methodOverride('_method'));
app.use(cors());
app.set('view engine','ejs');



app.get('/', getPeople )
app.get('/add', getForm);
app.get('/people/:person_id', getPerson)
app.post('/add', addPerson);
app.put('/update/:person_id',updatePerson)
app.delete('/delete/:person_id',deletePerson)
app.use('*',notFoundHandler);


function getPeople(req,res){
    const SQL = 'SELECT * FROM preptable;'
    client.query(SQL).then((resultList)=> {
        res.render('index', {people: resultList.rows});
    }).catch((err) => {
        errorHandler(err, req, res);
      });
    
}

function getForm(req,res){
    res.render('add-view');
}

function getPerson(req,res){
    const SQL='SELECT * FROM preptable WHERE id=$1;';
    const value=[req.params.person_id]
    client.query(SQL,value)
    .then((results)=>{
        res.render('detail-view',{person:results.rows[0]})
    })
    .catch((err)=>{
        errorHandler(err,req,res)
    })
}

function addPerson(req,res){
    const {name,age} =req.body;
    const SQL = 'INSERT INTO preptable (name,age) VALUES ($1,$2);';
    const values=[name,age];
     client.query(SQL,values)
    .then(()=>{
        res.redirect('/');
    })
    .catch((err)=>{
        errorHandler(err,req,res)
    })
    
}


function updatePerson(req,res){
    let{name,age}=req.body;
    const SQL ='UPDATE preptable SET name=$1,age=$2 WHERE id=$3 ;';
    const values=[name,age,req.params.person_id];
    client.query(SQL,values)
    .then((results)=>{
        res.redirect(`/people/${req.params.person_id}`)
    })
    .catch((err)=>{
        errorHandler(err,req,res)
    })
}

function deletePerson(req,res){
    let SQL='DELETE FROM preptable WHERE id=$1 ;';
    const value=[req.params.person_id]
    client.query(SQL,value)
    .then((results)=>{
        res.redirect('/')
    })
}




client.connect().then(()=>{
    app.listen(PORT,()=>console.log(`working on ${PORT}`))
})


function notFoundHandler(req, res) {
    res.status(404).send('Page not found.')
}

function errorHandler(err,req,res){
    res.status(500).send(err);
}



client.connect().then(()=>{
    app.listen(PORT,()=>console.log(`up and rining in port${PORT}`))
})

app.use('*',notFoundHandler);

function notFoundHandler(err,req,res){
    res.status(404).send('page not found')
}
function errorHandler(err,req,res){
    res.status(500).send(err)
}