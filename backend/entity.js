let users = [];
const addUsers = ({id,name,room})=>{
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();
    
    if(users.length){
        const existingUser = users.find(each => each.name === name && each.room === room);
        if(existingUser){
            return {error : "User already exist."}
        }
    }
    const user = {id, name, room}
    users.push(user)
    return {user}
}

//To remove the user
const removeUser = (id) =>{
    const findIdx= users.findIndex(each=>each.id == id);
    if(findIdx >= 0){
        return users.splice(findIdx,1)[0]
    }
}

//To get the user
const getUser = (id) => {
    return users.find(each => each.id == id); 
}

//To get all the users in room
const getUserInRoom = (room) => {
    return users.filter(each => each.room == room); 
}

module.exports = {
    addUsers,removeUser,getUser,getUserInRoom
}