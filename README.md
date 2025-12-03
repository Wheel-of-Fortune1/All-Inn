# All-Inn
## Installation Instructions
First, if you have not done so already, install both javascript and html to your computer before you attempt to do anything below as these are the two languages that are used by the game. 

In order to run our program you will need to do the following in VS code terminal:
```
git clone https://github.com/Wheel-of-Fortune1/All-Inn.git
cd All-Inn
npm install
cp .envexample .env
```
Change the code in .env to contain the following:
```
DATABASE_URL=postgresql://postgres.vxecktzcglywimpftayp:pineapplehorsetree5500%21%3F@aws-1-us-east-2.pooler.supabase.com:5432/postgres
```
After, doing this, you will now be able to run this in the terminal:
```
node back-end/server.js
```
And the website will now be displayed when you open http://localhost:3000
