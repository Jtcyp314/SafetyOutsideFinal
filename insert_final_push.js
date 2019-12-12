const {MongoClient} = require('mongodb');
const express = require('express');
const socketIO = require('socket.io');
        const PORT =   process.env.PORT || 3000;
        const INDEX = '/index.html';

/*const PORT =  process.env.PORT || 3000;
const INDEX = '/testSocket.html';

const server =  express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));*/





newListing = {"test" : "obj"};
global.stringLocalZip = "02155";
/*globoClient = new MongoClient("mongodb+srv://jtcyp314:COMP20Password@comp20final-zdrsz.mongodb.net/test?retryWrites=true&w=majority");
globoClient.connect();*/
global.count = 0;
send = {};
async function listDatabases(client)
{
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:")
;    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};




async function createNewListing()
{     

        var XMLHttpRequest = await require("xmlhttprequest").XMLHttpRequest;
        var xhr = await new XMLHttpRequest();


        console.log(stringLocalZip);
    await xhr.open("GET", 
        "https://cors-anywhere.herokuapp.com/https://api.openweathermap.org/data/2.5/forecast?zip=" + global.stringLocalZip + "&mode=json&appid=04e55ac87eaa2a6ec3b0fc7212888ebb", 
        false);
    await xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    //xhr.setRequestHeader('Access-Control-Allow-Origin','*')
    xhr.onreadystatechange = await function() 
    {

        try
        {

            result = xhr.responseText;
            info = JSON.parse(result)
            newListing = info
            //console.log(newListing);
            //console.log(newListing);
            //console.log(result);
            //console.log("try")
        }

        catch(e)
        {
            console.log("catch");
        }
      }

      await xhr.send();

}; 


async function createListing(client)
{
    try
    {
        await createNewListing();
        //console.log(newListing);

        await client.db("WeatherData").collection("WeatherTest").insertOne(newListing);
        send = await client.db("WeatherData").collection("WeatherTest").findOne();
        //console.log(newListing)
    }  

    catch (e) 
    {
        console.error(e);
    }
};









 async function sendListing(client, passedServer)
{
       const io =  socketIO(passedServer);
              
//         send = await client.db("WeatherData").collection("WeatherTest").findOne();

              //await client.db("WeatherData").collection("WeatherTest").findOneAndDelete({}).catch();
              //if(global.count != 0)
              
                //await createListing(client);
              
              console.log(send);
              
       
/*    try
    {*/
        io.on('connection',  function (socket) 
       {
          socket.on('test', function (areaCode, fn) 
          {
              //createNewListing(areaCode, client).catch();
              //createListing(client).catch();
              //global.stringLocalZip = areaCode;
                //   console.log(stringLocalZip);
              //createNewListing();
              //await createListing(globoClient).catch();

                  global.stringLocalZip = areaCode;
                  createNewListing();
                  send = newListing;

                  stringToSend =  JSON.stringify(send);
                  //console.log(stringLocalZip);

                //console.log(stringToSend)
                   fn(stringToSend);
              
           });
        });

              global.count ++;


       //console.log(send);
       //if(global.count != 0)
           await client.db("WeatherData").collection("WeatherTest").findOneAndDelete({}); 
/*    }

    catch(e)
    {
        console.error(e);    
    }*/
};


async function main()
{
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
    const uri = "mongodb+srv://jtcyp314:COMP20Password@comp20final-zdrsz.mongodb.net/test?retryWrites=true&w=majority";

    const client = new MongoClient(uri);



    try 
    {

/*        const PORT =  await process.env.PORT || 3000;
        const INDEX = '/testSocket.html';*/
        //app.listen(PORT)

        const server =  await express()
          .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
          .listen(PORT, () => console.log(`Listening on ${PORT}`));
          const app = new express()

        app.get('bikingcircle.png', function (req, res, next) {
    res.sendFile(path.join(__dirname,'bikingcircle.png'))
});
        // Connect to the MongoDB cluster

        //const io = await socketIO(server);
        await client.connect();
        //globoClient = client;





/*        io.on('connection', function (socket)
        {
              console.log("stringLocalZip");
           socket.on('setZip', function (areaCode, fn) 
           {
              stringLocalZip = areaCode;
              console.log(stringLocalZip)
  
            });
         });*/
         await createListing(client);
        await sendListing(client, server);

/*        await createListing(client);
        await sendListing(client, server);

        await createListing(client);
        await sendListing(client, server);

        await createListing(client);
        await sendListing(client, server);
        await createNewListing();*/

}
    catch (e) 
    {
        console.error(e);
    } 

    finally 
    {
        await client.close();
    }

};

main().catch(console.err);