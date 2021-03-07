import './App.css';
import React, {useState} from 'react'
import {useDropzone} from 'react-dropzone'
import {withRouter} from "react-router-dom";
import axios from 'axios'
import {Player, BigPlayButton} from 'video-react';
import './video-react.css';

const App = withRouter(({onClick, newSession, history}) => {

    const [isSelected, setIsSelected] = useState(false);
    const [isUploaded, setIsUploaded] = useState(false);

    const onDrop = acceptedFiles => {
        const formData = new FormData();
        acceptedFiles.forEach(file => {
            formData.append("slideImg", file);
        });

        setIsSelected(true);
        axios.post("http://localhost:8080/multiplefiles", formData, {}).then(res => {
            setIsUploaded(true);
        })
    }

    const {
        acceptedFiles,
        getRootProps,
        getInputProps
    } = useDropzone({
        accept: 'image/jpeg, image/png',
        onDrop
    });

    const files = acceptedFiles.map(file => (
        <li key={file.path}>
            {file.path} - {file.size} bytes
        </li>
    ));

    return (
        <div>
            {
                !isUploaded ?
                    !isSelected ?
                        <section className="container">
                            <div {...getRootProps({className: 'dropzone'})}>
                                <input {...getInputProps()} />
                                <p>Drop images here</p>
                            </div>
                            <aside>
                                <ul>{files}</ul>
                            </aside>
                        </section>

                        :
                        <section className="container">
                            <div {...getRootProps({className: 'dropzone'})}>
                                <img src="load.gif" className="loading" alt="loading"/>
                            </div>
                        </section>
                    :

                    <Player src="http://localhost:8080/video">
                        <BigPlayButton position="center" className="bigplaybutton"/>
                    </Player>
            }
        </div>
    );
});

export default App;