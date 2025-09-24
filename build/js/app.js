

const taskForm = document.querySelector('.task-form');
const taskInput = document.querySelector('.task-form__input');
const todoContainer = document.querySelector('.todo');
const taskList = document.querySelector('.task-list');
let DB;


document.addEventListener('DOMContentLoaded', ()=>{
    crearDB();


    taskForm.addEventListener('submit', (e)=>{
        e.preventDefault();

        if(taskInput.value === ''){
            printMessage('You need to add a new todo', 'error');
            return;  
        } 
        
        const task = taskInput.value;

        //Creamos el objeto con la informacion

        const activities = {
            id: '',
            task
        }
        
        activities.id = Date.now();
        console.log(activities);

        createTask(activities);
    })
})

function createTask(activities){
    const transaction = DB.transaction(['todo'], 'readwrite');
    const objectStore = transaction.objectStore('todo');

    objectStore.add(activities);


    transaction.onerror = function(){
        printMessage('Something is wrong', 'error');
    }
    transaction.oncomplete = function(){
        printMessage('Activity added', 'error');
    }
}




function crearDB(){
    const crearDB = window.indexedDB.open('todo', 1); //Abre o crea si no existe la DB. 1 Es la version de la DB

    // Si ocurre un error al abrir o crear la base de datos
    crearDB.onerror = function(){
        console.log('Existe un error'); 
    }

    crearDB.onsuccess = function(){
        DB = crearDB.result; //  Asignamos a DB la instancia de la base de datos (IDBDatabase). Con ella haremos transacciones, leeremos/escribiremos datos y accederemos a object stores.
        // La instancia (IDBDatabase) es el objeto vivo que te da conexión a la BD. Sin ella, no puedes leer ni escribir nada.
    }

    // Se ejecuta al crear la BD por primera vez o al subir de versión
    crearDB.onupgradeneeded = function(e){
     // Aquí definimos la estructura: object stores, índices, etc.
     const db = e.target.result; // Obtenemos la instancia de la BD recién creada o actualizada

    // Creamos un "object store" llamado 'todo' (similar a tabla)
    /* IDBObjectStore es una interfaz fundamental que representa un almacén de objetos dentro de una base de datos. 
    Actúa como una tabla en bases de datos relacionales, permitiendo almacenar y acceder a datos de manera eficiente.
    */

    // 'keyPath: id' indica que el campo 'id' será la clave primaria
    // 'autoIncrement: true' genera IDs automáticos si no los pasamos
     const objectStore = db.createObjectStore('todo', {keyPath: 'id', autoincrement: true});

     objectStore.createIndex('activity', 'activity',  {unique: true});
     objectStore.createIndex('id', 'id', {unique: true});


     console.log('DB Lista y creada')

    }

    function saveActivities(){
        //Abre (o crea si no existe) la base de datos todo en version 1
        const openConnection = indexedDB.open('todo', 1);

        openConnection.onerror = function(){
            console.log('Existe un error')
        }

        openConnection.onsuccess = function(){
            //Guardamos la referencia de la base abierta en DB
            DB = openConnection.result;        
        }

       /*  openConnection.onupgradeneeded = function(){
            const 
        } */
    }

   /*  function getActivities(){
        // Abre (o crea si no existe) la base de datos "crm" en versión 1
        const openConnection = window.indexedDB.open('todo', 1); 

        openConnection.onerror = function(){
            console.log('Hubo un error');
        }

        openConnection.onsuccess = function(){
            //Guardamos la referencia de la base abierta en DB
            DB = abrirConexion.result;

            //Creamos una transaccion de solo lectura sobre el store "todo"

            const objectStore = DB.transaction('todo').objectStore('todo');

            //Abrimos un cursor para recorrer todos los registros del store
            objectStore.openCursor().onsuccess = function(e){
                //El cursor apunto al registro actual
            }
        }

        
    } */
}

function printMessage(message, type){
    if(!document.querySelector('.notification')){
        const notification = document.createElement('div');
        notification.classList.add('notification', 'show');

        const notificationText = document.createElement('P');
        notificationText.classList.add('notification__text')
        notificationText.textContent = message;

        
        todoContainer.insertBefore(notification, taskList)
        notification.appendChild(notificationText);


        if(type !== 'error'){
            console.log('logrado')
        } else{
            notification.classList.add('error');
            notificationText.classList.add('errorText', );
        }

        setTimeout(() => {
            notification.remove();
        }, 3000);
    } else{
        return;
    }
   



  


    


 
}