let DB;
const form = document.querySelector('.task-form');
const inputTask = document.querySelector('.task-form__input');
const inputCheckbox = document.querySelector('.checkbox');

const todoContainer = document.querySelector('.todo');
let taskList;
 let total = 0;


/* 
PENDIENTE DE HACER QUE AL MARCAR UN CHECKBOX SE GUARDA EN LA BD
CONTAR LOS ELEMENTOS.
ELIMINARLOS

*/



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
       
        window.location.reload();
 
        
      
     
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
        //Agregamos padre UL al codigo (Solo una vez)
        if(!document.querySelector('.task-list')){
            taskList = document.createElement('UL');
            taskList.classList.add('task-list');
            todoContainer.insertBefore(taskList, document.querySelector('.summary') );
        }


        //Referencia de la database abierta
        DB = openConnection.result;

        //Creamos una transaction de solo lectura sobre el store

        const objectStore = DB.transaction('tasks').objectStore('tasks');
        objectStore.openCursor().onsuccess = function(e){

            //En pcoas palabras registros
            const cursor = e.target.result;
            
            //si el cursor existe, continuas creando registros
            if(cursor){
            
                /* Object destructuring para obtener los resultados de cursor.value y guardarlos en variabes*/
                const {task, status, id} = cursor.value;

                /* if(document.querySelector('.task-list__element')){
                    document.querySelector('.task-list__element').remove();
                } */

                const taskListElement = document.createElement('LI');
                taskListElement.classList.add('task-list__element');

                const checkbox = document.createElement('INPUT');
                checkbox.type = "checkbox";
                checkbox.id = id;
                checkbox.classList.add('checkbox');

                if(cursor.value.status){
                    checkbox.checked = true;
                    
                } else{
                    checkbox.checked = false
                }


                const label = document.createElement('LABEL');
                label.classList.add('task-list__label');
                label.htmlFor = id;
                label.textContent = task;

                taskList.appendChild(taskListElement);
                taskListElement.appendChild(checkbox);
                taskListElement.appendChild(label);

                cursor.continue();
                
            } else{
                sendAlert('All Data Loaded');
                        itemsCounter();
                
          
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
        getTasks();
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

function itemsCounter(){
    const allCheckboxs = document.querySelectorAll('.checkbox:not(#task-form)');
   
    
    allCheckboxs.forEach(checkbox =>{
        total++;
        if(checkbox.checked){
            total--;
        }

   
    })
 
    const itemsCount = document.querySelector('.summary__items--count');
    itemsCount.textContent = total;


}