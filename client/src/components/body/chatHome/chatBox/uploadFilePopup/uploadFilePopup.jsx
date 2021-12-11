/* eslint-disable import/first */
import "./uploadFilePopup.scss";
import React, { useState } from "react";
import { useParams } from "react-router";
import {
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
const axios = require("axios");

import { FILE, TEXT } from "../../../../../constants/message";
import {
  DIRECT_MESSAGE,
  GROUP_MESSAGE,
} from "../../../../../constants/conversation";

const Input = styled("input")({
  display: "none",
});

function UploadFilePopup(props) {
  const { conversationId } = useParams();

  const {
    open,
    setOpen,
    token,
    socket,
    conversation,
    setLastestSentMsg,
    partner,
    userId,
  } = props;

  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedValue, setUploadedValue] = useState();

  const handleCancel = () => {
    setOpen(false);
  };

  const handleOk = () => {
    const bodyFormData = new FormData();
    bodyFormData.append("file", uploadedValue);
    token &&
      axios({
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data",
        },
        data: bodyFormData,
        url: "/api/upload_avatar",
      })
        .then((res) => {
          const { url: filePath } = res.data;

          axios({
            method: "POST",
            data: {
              type: FILE,
              path: filePath,
            },
            headers: {
              Authorization: token,
            },
            url: `/api/conversations/${conversationId}/messages`,
          })
            .then((res) => {
              setLastestSentMsg(uploadedFileName);
              if (conversation.type === DIRECT_MESSAGE)
                socket.current.emit("new-message", {
                  receiverId: partner._id,
                  message: uploadedFileName,
                });
              else if (conversation.type === GROUP_MESSAGE) {
                const othersMem = conversation.members.filter(
                  (mem) => mem !== userId
                );
                othersMem.forEach((mem) => {
                  socket.current.emit("new-message", {
                    receiverId: mem._id,
                    message: uploadedFileName,
                  });
                });
              }
              setOpen(false);
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
  };

  const handleUploadOnChange = (e) => {
    setUploadedFileName(e.target.value.split(`C:\\fakepath\\`)[1]);
    setUploadedValue(e.target.files[0]);
    console.log(e.target.files[0]);
  };

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
    >
      <DialogTitle className="dialog-title">Upload File</DialogTitle>
      <DialogContent className="dialog-content" dividers>
        <label htmlFor="icon-button-file">
          <Input
            id="icon-button-file"
            type="file"
            onChange={handleUploadOnChange}
          />
          <IconButton
            color="primary"
            aria-label="upload picture"
            component="span"
          >
            <PhotoCamera />
          </IconButton>
        </label>
        <p>{uploadedFileName}</p>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleOk}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
}

export default UploadFilePopup;
