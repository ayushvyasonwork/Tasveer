import React from "react";
import { useNavigate } from "react-router-dom";
import Game from "./Game";

const GameWithNavigate = (props) => {
    const navigate = useNavigate();
    return <Game {...props} navigate={navigate} />;
};

export default GameWithNavigate;
