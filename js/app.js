let DB;
const form = document.querySelector('.task-form');
const inputTask = document.querySelector('.task-form__input');
const inputCheckbox = document.querySelector('.checkbox');




window.onload = () =>{
    crearDB();
}


form.addEventListener('submit', (e) =>{
    e.preventDefault();
    taskValidation(inputTask.value, inputCheckbox.checked);
    form.reset();

})


function taskValidation(task, status){
    if(task.trim() === ''){
        sendAlert('Task cannot be empty', 'error');
        return; 
    }

    const taskObj = {
        task,
        status,
    }

    createTask(taskObj)
    
}

function createTask(task){

    if(!DB){
        sendAlert('DataBase not ready yet. Try again', 'error');
        return;
    }
    const transaction = DB.transaction(['tasks'], 'readwrite');
    const objectStore = transaction.objectStore('tasks');

    objectStore.add(task);

    transaction.onerror = function(){
        sendAlert('Something is wrong', 'error');
        console.log('existe erorr')
    }
    transaction.oncomplete = function(){
        sendAlert('task added', '');
        getTasks();
    }

}

function getTasks(){
    //Open the database
    const openConnection = window.indexedDB.open('todoApp', 1);

    //si ocurre un error al abrir la DB

    openConnection.onerror = function(){
        sendAlert(`Something went wrong`, 'error')
    }

    openConnection.onsuccess = function(){
        //Referencia de la database abierta
        DB = openConnection.result;

        //Creamos una transaction de solo lectura sobre el store

        const objectStore = DB.transaction('tasks').objectStore('tasks');


        objectStore.openCursor().onsuccess = function(e){

            //En pcoas palabras registros
            const cursor = e.target.result;
            
            //si el cursor existe, continuas creando registros
            if(cursor){
                //cursor.value es el objeto almacenado hasta indexed DB

                console.log(cursor.value);
            }
        }
    }
}


function crearDB(){
    //Crea la base de datos en version 1.0
    const crearDB = window.indexedDB.open('todoApp', 1);

    crearDB.onerror = function(){
        console.log('Hubo un error');
    }

    crearDB.onsuccess = function(){
        DB = crearDB.result;
    }

    crearDB.onupgradeneeded = function(e){
        const db = e.target.result;

        //Definimos configuracion de la database
        const objectStore = db.createObjectStore('tasks', {
            keyPath: 'id',
            autoIncrement: true
        })

        //Definimos columnas
        objectStore.createIndex('task', 'task', {unique: true});
        objectStore.createIndex('status', 'status', {unique: false});
    }

}


function sendAlert(message, type){

    if(document.querySelector('.notification')){
        document.querySelector('.notification').remove();
    }

    const alert = document.createElement('DIV');
    const alertMessage = document.createElement('P');
    alert.classList.add('notification', 'show');
    alertMessage.textContent = message;
    alertMessage.classList.add('notificacion__text');
    form.appendChild(alert);
    alert.appendChild(alertMessage)

    if(type == 'error'){
        alert.classList.add('notificationError');
        alertMessage.classList.add('textError');

    }

}