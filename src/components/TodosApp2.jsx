import React, {useState, useContext, useEffect } from "react";
import { Appwrite } from "../appwrite/config";
import { UserId } from "./Dashboard";
import { Query } from "appwrite";
import {v4 as uuid} from 'uuid';


const TodosApp = () => {
const userId = useContext(UserId);

    // state for todolist
const [todosList, setTodosList] = useState([]);
const [tasksList, setTasksList] = useState([]);
const [tasksTodo, setTasksTodo] = useState();

const getTodos = () =>{
   const getTodo = Appwrite.DATABASE.listDocuments(Appwrite.DATABASE_ID,Appwrite.COLLECTION_TODOS_ID,[
    Query.equal('userId',userId)
]);
   getTodo.then(function(response){
    setTodosList(response.documents);
   },
   function(error){
    console.log(error);
   })
}

  
useEffect(()=>{
  getTodos();
},[userId]);


// setUserId(useContext(UserId));

const getTasks = async(id) =>{
    const getTask = Appwrite.DATABASE.getDocument(Appwrite.DATABASE_ID,Appwrite.COLLECTION_TODOS_ID,id);
    getTask.then(function(response){
      let tasks = [];
      response.Tasks.map((item)=>{
        tasks.push(JSON.parse(item));
      })
      
      setTasksList(tasks);

       response.Tasks='';
        setTasksTodo(response)
    },
    function(error){
     console.log(error);
    })
 }



// Call Modal as per click by user
const [modal, setModal] = useState(null);
const [isModal, setIsModal] = useState(false);

const loadModal = (action,type,id) =>{
  const modal = {
    title:action +' '+type,
    placeholder:'Enter '+type+' Name',
    button:action
  }
    // handle submit of form
    const handleSubmit = async(event) =>{
      event.preventDefault();
      const Title = document.getElementById('title').value;
    
      const TasksTodos = (action, Title, id) => {
        const tasksArray = tasksList;
        if (action === 'Create') {
          let task = {
            "taskId": uuid(),
            "title": Title,
            "isDone": false,
            "createdAt": Date.now(),
            "updatedAt": Date.now()
          };
          tasksArray.push(task);
          const taskJson = JSON.stringify(tasksArray);
          return taskJson;
        }
        if (action === 'Update') {
          let index = tasksArray.findIndex((task => task.taskId == id));
          console.log(index);
          tasksArray[index].updatedAt = Date.now();
          tasksArray[index].title = Title;
          console.log(JSON.stringify(tasksArray));
          return tasksArray;
        }
      }
      

      if(type==='Todo'){
        switch (action) {
          case 'Create':
            const createTodo = Appwrite.DATABASE.createDocument(Appwrite.DATABASE_ID,Appwrite.COLLECTION_TODOS_ID,Appwrite.ID.unique(),{title:Title,userId});
            createTodo.then(function(response){
              getTodos();
            },
            function(error){
              console.log(error);
            })
            break;
        case 'Update':
          const updateTodo = Appwrite.DATABASE.updateDocument(Appwrite.DATABASE_ID,Appwrite.COLLECTION_TODOS_ID,id,{title:Title});
          updateTodo.then(function(response){getTodos();},function(error){console.log(error);})
          break;
          default:
            break;
        }
      }

      if(type==='Task'){
        switch (action) {
          case 'Create':
            let createArray = TasksTodos('Create',Title,id);

            console.log(createArray);
            const createTask = Appwrite.DATABASE.updateDocument(Appwrite.DATABASE_ID,Appwrite.COLLECTION_TODOS_ID,id,{'Tasks':createArray})
            createTask.then(function(response){ 
             getTasks(id); console.log(response);},function(error){console.log(error);})
            break;
        case 'Update':
           let  updateArray = TasksTodos('Update',Title,id);
           console.log(updateArray);
          const updateTask = Appwrite.DATABASE.updateDocument(Appwrite.DATABASE_ID,Appwrite.COLLECTION_TODOS_ID,tasksTodo.$id,{'Tasks':updateArray});
          updateTask.then(function(response){getTasks(tasksTodo.$id)},function(error){console.log(error);})
          break;
          default:
            break;
        }
      }

      document.getElementById('title').value='';
      document.getElementById('success').classList.toggle('hidden');
    }
  
      const handleClose = () => {
          document.getElementById('modal').classList.toggle('hidden');
          setIsModal(false);
        };

  return(
    <>
    {/* ********** modal  */}
    <div className="modal fade h-98 fixed top-1/3 left-1/2 w-96 -translate-x-2/4 -translate-y-2/4 rounded shadow-lg shadow-gray-900 outline" id="modal" tabindex="-1">
      <div className="modal-dialog pointer-events-none relative w-auto">
        <div className="modal-content pointer-events-auto relative flex w-full flex-col rounded-md border-none bg-white bg-clip-padding text-current shadow-lg outline-none">
          <div className="modal-header flex flex-shrink-0 items-center justify-between rounded-t-md border-b border-gray-200 p-4">
            <h5 className="text-xl font-medium leading-normal text-gray-800" id="modalTitle">{modal.title}</h5>
            <button type="button" className="btn-close box-content h-4 w-4 rounded-none border-none p-1 text-black opacity-50 hover:text-black hover:no-underline hover:opacity-75 focus:opacity-100 focus:shadow-none focus:outline-none" onClick={handleClose}>X</button>
          </div>
          <div className="modal-body relative p-4">
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-6">
                <input onFocus={()=>(document.getElementById('success').classList.add('hidden'))} type="text" className="form-control m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-1.5 text-base font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none" name="title" id="title" placeholder={modal.placeholder} />
              </div>
              <button type="submit" className="w-full rounded bg-blue-600 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg" id="modalSubmitButton">{modal.button}</button>
            </form>
          </div>
    
          <div className="modal-footer flex flex-col justify-center rounded-b-md border-t border-gray-200 p-4 hidden" id="success">
            <h1 className="mb-1 text-center font-medium text-green-700" >
              <strong>{type} {action}d  Successfully</strong> <br />
              click on Close
            </h1>
            <button type="button" className="rounded bg-purple-600 w-32 mx-auto px-6 py-2.5 text-xs font-medium uppercase text-white shadow-md hover:bg-purple-700 hover:shadow-lg" onClick={handleClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
    
    </>)
}

const callModal = (type,id) => {

  switch (type) {
    case 'todoCreate':
      setModal(loadModal('Create','Todo',id));
      break;
    case 'todoUpdate':
      setModal(loadModal('Update','Todo',id));
      break;
    case 'todoDelete':
      setModal(loadModal('Delete','Todo',id));
      break;
    case 'taskCreate':
      setModal(loadModal('Create','Task',id));
      break;
    case 'taskUpdate':
      setModal(loadModal('Update','Task',id));
      break;
    case 'taskDelete':
      setModal(loadModal('Delete','Task',id));
      break;
    default:
      break;
  }
  setIsModal(true);

}

const deleteModal = async(type,id)=>{
  if(type==='Todo'){
  const deletetodo = Appwrite.DATABASE.deleteDocument(Appwrite.DATABASE_ID,Appwrite.COLLECTION_TODOS_ID,id);
  deletetodo.then(function(response){
    getTodos();
    console.log(response);
  },
  function(error){
    console.log(error);
  })}

  if(type==='Task'){

    const deletetask = Appwrite.DATABASE.deleteDocument(Appwrite.DATABASE_ID,Appwrite.COLLECTION_TODOS_ID,id);
    deletetask.then(function(response){
      getTasks(tasksTodo.$id)
    console.log(response);
  },
  function(error){
    console.log(error);
  })
  }

}
const taskIsDone = async(id,isDone)=>{
  let tasksArray = tasksList;
let index =tasksArray.findIndex((task => task.taskId == id));
console.log(index);
tasksArray[index].updatedAt=Date.now();
tasksArray[index].isDone=isDone;
tasksArray = JSON.stringify(tasksArray);
console.log(tasksArray);
  const isDoneTask = Appwrite.DATABASE.updateDocument(Appwrite.DATABASE_ID,Appwrite.COLLECTION_TODOS_ID,tasksTodo.$id,{'Tasks':tasksArray});
  isDoneTask.then(function(response){
    getTasks(tasksTodo.$id)
  console.log(response);
},
function(error){
  console.log(error);
})
}

const searchTodos = async() =>{
  const queryString = document.getElementById('search-input').value;
    const searchResult = Appwrite.DATABASE.listDocuments(Appwrite.DATABASE_ID,Appwrite.COLLECTION_TASKS_ID,[
      Query.search('title',queryString),
       Query.equal('userId',userId)

    ]);
    const searchResult2 = Appwrite.DATABASE.listDocuments(Appwrite.DATABASE_ID,Appwrite.COLLECTION_TODOS_ID,[
      Query.search('title',queryString),
      
      Query.equal('userId',"6384883dc8dba5559cb5")
      
    ]);
    searchResult.then(function(response){
      console.log(response);
    },
    function(error){
      console.log(error);
    })

    searchResult2.then(function(response){
      console.log('Search Result Two');
      console.log(response);
    },
    function(error){
      console.log(error);
    })
}

return(<>
       {/* main conatiner  */}
        <main className="h-5/6 bg-gray-300 h-full">
        

        {/* /// Search Bar  */}
    <div className="flex justify-center w-1/2 mx-auto py-4">
    <div className="input-group relative flex w-full">
      <input id='search-input' type="search" className="form-control relative flex-auto min-w-0 block w-full px-3 text-base font-normal text-gray-700 bg-white bg-clip-paddin rounded-l" placeholder="Query..." />
      <button onClick={()=>{searchTodos()}} className="btn px-4 py-2 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded-r shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700  flex items-center" type="button" id="search-button">
        <svg className="w-4" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path fill="currentColor" d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path>
        </svg>
      </button>
    </div>
  </div>

      {/* Todo Task listing and updatings */}
            <div className="w-full flex px-2 py-4 pb-24 h-full divide-x-2">

                {/* *** TODOS LIST LEFT SIDE*** */}
                <div className="w-1/5 h-full bg-gray-300 h-[90%]">
                <div className="p-1 rounded bg-blue-800 flex justify-between mb-2 text-white">
                        <h2 className="m-auto text-2xl font-bold text-gray-200">Todos List</h2>
                        <i onClick={()=>{callModal('todoCreate',null)}} className="fa-solid fa-plus bg-gray-800 p-2 rounded-lg text-center text-2xl hover:cursor-pointer hover:cursor-pointer hover:bg-blue-600 pr-2"></i>
                    </div>
    <div className="h-full overflow-y-auto px-2">   
            {todosList && todosList.map((todos)=>(
                <div key={todos.$id} className="flex w-full bg-gray-400 rounded shadow-lg mb-2">
                    <div className="w-4/6 text-gray-900 hover:bg-blue-800 hover:text-white hover:rounded hover:cursor-pointer py-2 p-2">
                        <a onClick={()=>{getTasks(todos.$id)}}>
                        <h1 className="font-bold text-xl m-auto">
                            {todos.title}
                        </h1>
                        </a>
                    </div>
                    <div className="flex h-[2rem] px-2 m-auto w-2/6 justify-between text-white">
                        <i onClick={()=>{callModal('todoUpdate',todos.$id)}} className="fa-regular fa-pen-to-square bg-gray-800 p-2 rounded text-center hover:cursor-pointer hover:cursor-pointer hover:bg-blue-600"></i>
                        <i onClick={()=>{deleteModal('Todo',todos.$id)}} className="fa-solid fa-trash-can bg-gray-800 p-2 rounded text-center hover:cursor-pointer hover:bg-blue-600"></i>
                    </div>
                </div> ))}   
    </div>

                </div>
                
                {/* *** TASKS LIST RIGHT SIDE*** */}
                <div className="w-4/5 h-[90%] px-3" id='tasksList-section'>
                {tasksTodo ? (<><div className="p-1 rounded bg-blue-800 flex justify-between mb-2 text-white">
                <h2 className="m-auto text-2xl font-bold text-gray-200">Todo List <span className="text-2xl font-bold py-4 px-2 uppercase">: {tasksTodo.title}</span></h2>
                    <div className="pr-2">
                   <i onClick={() => {callModal('taskCreate',tasksTodo.$id)}} className="fa-solid fa-plus bg-gray-800 p-2 rounded-lg text-center text-2xl hover:cursor-pointer hover:cursor-pointer hover:bg-blue-600"></i>
                    </div> 
                    </div> 
                
                    <div className="h-full overflow-y-auto px-2">

                      
                      {/* // Task Incompleted */}

                <h1 className="font-bold text-2xl text-yellow-800 mb-1">Task Incompleted :</h1>
                    {tasksList.map((item) => (<>
                      {item.isDone ? ('')
                      :(<div key={item.taskId} className="flex w-full bg-gray-400 rounded p-2 shadow-lg mb-2">
                        <i onClick={() => {taskIsDone(item.taskId,true)}} className="fa-regular fa-square p-2 rounded text-center hover:cursor-pointer hover:bg-blue-600 mr-2 text-orange-700"></i>
                         
                          <h1 className="w-5/6 font-bold text-gray-900 text-2xl m-auto">
                              {item.title}
                          </h1>
                          <div className="flex w-1/6 justify-end text-white">
                              <i onClick={() => {callModal('taskUpdate', item.taskId)}} className="fa-regular fa-pen-to-square bg-gray-800 p-2 rounded text-center hover:cursor-pointer hover:cursor-pointer hover:bg-blue-600"></i>
                              <i onClick={() => {deleteModal('Task', item.taskId)}} className="fa-solid fa-trash-can bg-gray-800 p-2 rounded text-center hover:cursor-pointer hover:bg-blue-600 mx-6"></i>
                          </div>
                      </div>)}
                       </> ))}
                
                {/* // Task Completed */}
                
          <h1 className="font-bold text-2xl text-green-700 mb-1">Task completed :</h1>
                    {tasksList.map((item) => (<>
                         {item.isDone ? (<div key={item.taskId} className="flex w-full bg-gray-600 rounded p-2 shadow-lg mb-2">
                          <i onClick={() => {taskIsDone(item.taskId,false)}} className="fa-solid fa-check-double text-2xl rounded text-center hover:cursor-pointer hover:bg-blue-600 mr-2 text-orange-700"></i>
                            <h1 className="w-5/6 font-bold text-gray-900 text-2xl m-auto">
                                {item.title}
                            </h1>
                            <div className="flex w-1/6 justify-end text-white">
                                <i onClick={() => {callModal('taskUpdate', item.taskId)}} className="fa-regular fa-pen-to-square bg-gray-800 p-2 rounded text-center hover:cursor-pointer hover:cursor-pointer hover:bg-blue-600"></i>
                                <i onClick={() => {deleteModal('Task', item.taskId)}} className="fa-solid fa-trash-can bg-gray-800 p-2 rounded text-center hover:cursor-pointer hover:bg-blue-600 mx-6"></i>
                            </div>
                        </div>):('')} 
                      </>))}

                      </div>
                </>) : ('')}

              </div>
                {isModal ? (modal):('')}
            </div>

        </main>

    </>)
}


export default TodosApp;