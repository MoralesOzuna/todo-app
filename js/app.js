const taskForm = document.querySelector('.task-form');
const taskInput = document.querySelector('.task-form__input');
const todoContainer = document.querySelector('.todo');
const clearButton = document.querySelector('.summary__clear');
let taskList;
let totalItems = 0;
let DB;


document.addEventListener('DOMContentLoaded', ()=>{
    crearDB();
    getTask();
    

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
            task,
            completed: false
        }
        
        activities.id = Date.now();
        createTask(activities);
       
    })

    clearButton.addEventListener('click', () =>{
        deleteTasks();
    })
})


function deleteTasks(){

    //Obtengo los task list element // COMPLETED
    //Accedo al checkbox // COMPLETED
    //verifico si el checkbox esta activo //COMPLETED
    //Si esta activo saco el id //Completed
    //lo comparo con los id de la indexeddb
    //elimino los id
    let taskList2 = document.querySelectorAll('.task-list__element:not(.summary)');

    taskList2.forEach(element =>{
        const checkbox = element.querySelector('input[type="checkbox"]');
        
        if(checkbox.checked){
            const idCleaned = parseInt(checkbox.id.replace('task-', ''));
            const transaction = DB.transaction(['todo'], 'readwrite');
            const objectStore = transaction.objectStore('todo');

            objectStore.delete(idCleaned);

            transaction.onerror = function(){
                console.log('Algo no salio bien');
            } 

            transaction.oncomplete = function(){
                console.log('Se pudo');
                taskList.innerHTML = '';
        
                getTask();
                
            }

        }

    })
}

//Agregamos tarea del input al objectStore
function createTask(activities){
    const transaction = DB.transaction(['todo'], 'readwrite');
    const objectStore = transaction.objectStore('todo');

    objectStore.add(activities);


    transaction.onerror = function(){
        printMessage('Something is wrong', 'error');
    }
    transaction.oncomplete = function(){
        printMessage('Activity added', 'error');

        taskList.innerHTML = '';
        getTask();
    }
}

//Obtenemos los datos del IndexDb y los mostramos en pantalla
function getTask(){
    //open o create the database "crm" if it doesn't exist
    const abrirConexion = window.indexedDB.open('todo', 1);

    //If something goes wrong
    abrirConexion.onerror = function(){
        printMessage(`There's something bad`, 'error');
    }

    //If the connection is successfully
    abrirConexion.onsuccess = function(){
        //Agregamos padre UL al codigo (Solo una vez)
        if(!taskList){

            taskList = document.createElement('UL');
            taskList.classList.add('task-list');
            todoContainer.insertBefore(taskList, document.querySelector('.summary') );
        }
        DB = abrirConexion.result;

        //Create an only read transaction
        const objectStore = DB.transaction('todo').objectStore('todo');

        //Open a "cursor" to read every data saved in the localStorage
        objectStore.openCursor().onsuccess = function(e){
            // El cursor apunta al registro actual
            const cursor = e.target.result;
        
            if(cursor){
                // cursor.value es el objeto almacenado en IndexedDB
                const  {task, id} = cursor.value;

                const taskListElement = document.createElement('LI');
                taskListElement.classList.add('task-list__element');

                const checkbox = document.createElement('INPUT');
                checkbox.type = "checkbox";
                checkbox.id = `task-${id}`;
                checkbox.classList.add('checkbox');
             
                const label = document.createElement('LABEL');
                label.classList.add('task-list__label');
                label.htmlFor = `task-${id}`
             
                label.classList.add('task-list__label');
                label.textContent = `${task}`;
                taskList.appendChild(taskListElement);
                taskListElement.appendChild(checkbox);
                taskListElement.appendChild(label);

                
                if(cursor.value.completed){
                    checkbox.checked = true;
                } else{
                    checkbox.checked = false;
                }
          
                
                //cursor.continue() avanza al siguiente registro
                cursor.continue();
             
            } else{
                printMessage('All Data Loaded', 'success');   
                   itemsCounter();    
            }
            
   
        }
       
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
     const objectStore = db.createObjectStore('todo', {keyPath: 'id'});

     objectStore.createIndex('task', 'task',  {unique: true});
     objectStore.createIndex('id', 'id', {unique: true});


     console.log('DB Lista y creada')

    }
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

function itemsCounter(){

    const taskListElements = document.querySelectorAll('.task-list__element:not(.summary)');
    const countSpan = document.querySelector('.summary__items--count');
    
    // Contar cuántos checkboxes NO están marcados
    let count = 0;
    taskListElements.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) {
            count++;
        }
    });

    // Actualizamos el texto
    countSpan.textContent = count;

    taskListElements.forEach(listElement =>{

        listElement.firstChild.addEventListener('change', (e) =>{
  
            if(e.target.checked){
                const transaction = DB.transaction(['todo'], 'readwrite');
                const objectStore = transaction.objectStore('todo');

                objectStore.openCursor().onsuccess = function(e){
                    const cursor = e.target.result;
                    

                    if(cursor){
                        const dbId = cursor.value.id;
                        const idCleaned = parseInt(listElement.firstChild.id.replace('task-', ''));
                    
                        if(dbId === idCleaned){
                            cursor.value.completed = true;
                            console.log('Coincidencia encontrada: ', cursor.value);
                            cursor.update(cursor.value);
                        }
                           cursor.continue()
                    }   
                }
            } else{
            
                const transaction = DB.transaction(['todo'], 'readwrite');
                const objectStore = transaction.objectStore('todo');

                objectStore.openCursor().onsuccess = function(e){
                    const cursor = e.target.result;
                
                    if(cursor){
                        const dbId = cursor.value.id;
                        const idCleaned = parseInt(listElement.firstChild.id.replace('task-', ''));


                         if(dbId === idCleaned){
                            cursor.value.completed = false;
                            console.log('Falso de nuevo : ', cursor.value);
                            cursor.update(cursor.value);
                        }
                            cursor.continue();
                    }
             
                }
              
            }
              itemsCounter();
      
        })
        
    })
    

    




}  


    


    
 

