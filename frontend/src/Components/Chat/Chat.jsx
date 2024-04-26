import React, { useEffect, useState, useRef, Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars} from '@fortawesome/free-solid-svg-icons';
import io from 'socket.io-client';
import Swal from 'sweetalert2';
import Modal from './Modal';

function Chat() {
    const backEndUrl = 'http://localhost:8000/';

    const [user, setUser] = useState("");
    const [room, setRoom] = useState("");
    const [messages, setMessages] = useState([]);
    const [msg, setMsg] = useState("");
    const [activeUsers, setActiveUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false); // State to control tooltip visibility
    const [isMsgEmpty, setIsMsgEmpty] = useState(true); // State to track whether the message textarea is empty
    const socketRef = useRef(null);

    useEffect(() => {
        // Retrieve user and room from session storage or other sources
        const name = JSON.parse(sessionStorage.getItem('name'));
        const room = JSON.parse(sessionStorage.getItem('room'));

        setUser(name);
        setRoom(room);

        // Create and store the socket connection
        socketRef.current = io(backEndUrl);

        // Check if name or room is empty
        if (!name || !room) {
            window.location.href = 'http://localhost:3000/';
            return; // Return to prevent further execution of the hook
        }

        // Join the chat room
        socketRef.current.emit('join', { name: name, room: room }, (error) => {
            if (error) {
                Swal.fire({
                    title: 'Error!',
                    text: error,
                    icon: 'error',
                    confirmButtonText: 'OK',
                }).then(() => {
                    // Redirect user to a page
                    window.location.href = 'http://localhost:3000/'; // Replace with your desired URL
                });
            }
        });

        // Cleanup function to disconnect socket
        return () => {
            socketRef.current.disconnect();
        };

    }, []);

    useEffect(() => {
        // Listen for incoming messages
        socketRef.current.on('message', msg => {
            setMessages(prevMessages => [...prevMessages, msg]);

            setTimeout(() => {
                var objDiv = document.getElementById("chat_body");
                objDiv.scrollTop = objDiv.scrollHeight;
            }, 100)
        });

        socketRef.current.on('activeUsers', users => {
            setActiveUsers(users);
        });

        // Add event listener for window close or reload
        window.addEventListener("beforeunload", clearSession);

        // Cleanup function to remove event listener
        return () => {
            window.removeEventListener("beforeunload", clearSession);
        };

    }, []);

    useEffect(() => {
        // Check if the message textarea is empty
        setIsMsgEmpty(msg.trim() === '');
    }, [msg]);

    const clearSession = () => {
        sessionStorage.removeItem('name');
        sessionStorage.removeItem('room');
    };

    const sendMessage = (e) => {
        e.preventDefault();
        socketRef.current.emit('sendMsg', msg, () => setMsg(""));

        setTimeout(() => {
            var objDiv = document.getElementById("chat_body");
            objDiv.scrollTop = objDiv.scrollHeight;
        }, 100)
    }

    const handleUserHover = () => {
        // Show the tooltip after a delay
        const timeout = setTimeout(() => {
            setShowTooltip(true);
        }, 500); // Adjust this delay as needed

        // Clear the timeout if the user moves away from the user element before the delay
        return () => clearTimeout(timeout);
    };

    const handleUserLeave = () => {
        // Hide the tooltip when the user moves away from the user element
        setShowTooltip(false);
    };

    const handleLeaveChat = () => {
        // Close the current window and redirect to http://localhost:3000/
        window.close();
        clearSession();
        window.location.href = 'http://localhost:3000/';
    };

    return (
        <div className="min-h-screen py-20" style={{ backgroundImage: 'linear-gradient(115deg, #9F7AEA, #FEE2FE)' }}>
            <div className="container mx-auto flex">
                <div className="flex flex-col w-8/12 bg-white rounded-xl mx-auto shadow-lg overflow-hidden">
                    <div className="w-full py-4 px-6 flex justify-between items-center">
                        <p className="text-black text-sm lg:text-2xl font-medium mb-3">
                            <Fragment>
                                <button onClick={() => setShowModal(true)}><FontAwesomeIcon icon={faBars} style={{ color: "#B197FC", }} /></button>
                                <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
                                    <div className='p-6'>
                                    <h3 className='text-xl font-semibold text-gray-900 mb-5 text-center'>
                                        <span className="underline">Active User</span>
                                    </h3>
                                        <p className='mb-5 italic text-gray-500'>
                                            <ul className="chat-list">
                                                {
                                                    activeUsers && activeUsers.length > 0 ? (
                                                        activeUsers.map((each, idx) => (
                                                            <Fragment key={idx}>
                                                                <li className="chat-item">
                                                                    <span className="chat-username">{each.name}</span>
                                                                    <span className="chat-status">Online</span>
                                                                </li>
                                                                {idx !== activeUsers.length - 1 && <hr className="chat-divider" />}
                                                            </Fragment>
                                                        ))
                                                    ) : (
                                                        <li>No active users</li>
                                                    )
                                                }
                                            </ul>
                                        </p>
                                    </div>
                                </Modal>
                            </Fragment>
                            <span style={{ marginLeft: '10px' }}>Hi,</span>
                            <span
                                onMouseEnter={handleUserHover}
                                onMouseLeave={handleUserLeave}
                                className="tooltip"
                            >
                                {user ? user.substring(0, 3) : ''}
                                {showTooltip && <span className="tooltiptext ">{user}</span>}
                            </span>
                            ! <span className="badge hidden sm:inline">Chat Room : {room}</span>
                        </p>
                        <div className="flex space-x-4">
                            <button onClick={handleLeaveChat} className="text-white text-sm lg:text-lg bg-red-500 py-2 px-4 lg:px-6 rounded-lg">Cancel Chat</button>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-b-lg">
                        <div className="p-4 flex flex-col">
                            <div className="flex flex-col space-y-2 overflow-y-auto max-h-[300px]" id="chat_body">
                                {
                                    messages.map((e, i) => (e.user === user?.toLowerCase() ?
                                        <div key={i} className="flex items-start">
                                            <div className="bg-gray-300 rounded-lg p-3">
                                                <p className="text-sm lg:text-lg">{e.text}</p>
                                                <p className="text-xs text-gray-500 text-right">{e.user}</p>
                                            </div>
                                        </div>
                                        :
                                        <div className="flex items-end justify-end" key={i}>
                                            <div className="bg-blue-500 rounded-lg p-3">
                                                <p className="text-white text-sm lg:text-lg">{e.text}</p>
                                                <p className="text-xs text-black text-right">{e.user}</p>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                            <div className="flex items-center border-t pt-4">
                                <textarea
                                    onChange={(e) => setMsg(e.target.value)} name="text_input" value={msg} className="flex-grow  text-sm lg:text-lg border rounded-lg p-2 mr-2" placeholder="Type your message here..."></textarea>
                                <button onClick={sendMessage} disabled={isMsgEmpty} className={`text-sm lg:text-lg px-4 py-2 bg-blue-500 text-white rounded-lg ${isMsgEmpty ? 'opacity-50 cursor-not-allowed' : ''}`}>Send</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Chat;
