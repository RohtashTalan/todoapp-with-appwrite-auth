import React, { createContext, useEffect, useState } from "react";
import {Appwrite} from '../appwrite/config';
import { useNavigate } from "react-router-dom";
import TodosApp from "./TodosApp";

let UserId='';


const Dashboard = () => {

    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState();

     UserId = createContext();
useEffect(()=>{
    const getUser = Appwrite.ACCOUNT.get();

    getUser.then(
        function(response){
            setUserDetails(response);
        },
        function(error){
            console.log(error);
        }
    )
},[])


return(
    <>

<div className="bg-gray-200 h-screen">
    {/* Header  */}
    <header className="h-16">
        <nav className="bg-gray-900 text-white p-4">
            <div className="flex justify-between text-3xl">
            <div>Logo</div>
            <div><i class="fa-solid fa-user"></i>  {userDetails && userDetails.name}<i class="fa-solid fa-right-from-bracket"></i>
                </div>
            </div>
        </nav>
    </header>

<UserId.Provider value={userDetails.$id}>
    <TodosApp />
</UserId.Provider>

     {/* Footer  */}
     <footer className="bg-gray-900 p-4 w-full h-16">
            <div>

            </div>
        </footer>
    </div>


</>
)
}


export default Dashboard;
export {UserId};