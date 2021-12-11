import React, { useState } from "react";
import {
  FormGroup,
  Checkbox,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
  FormControlLabel,
  Button,
  TextField,
} from "@mui/material";
import { GROUP_MESSAGE } from "../../../../constants/conversation";
import "./newGroupPopup.scss";
const axios = require("axios");

function NewGroupConversation(props) {
  const { open, setOpen, allUsers, token, setLastestGroupCreated, socket } =
    props;

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");

  const handleCancel = () => {
    setOpen(false);
  };

  const handleOk = () => {
    token &&
      axios({
        method: "POST",
        headers: {
          Authorization: token,
        },
        data: {
          otherMembers: selectedUsers,
          type: GROUP_MESSAGE,
          name: groupName,
        },
        url: "/api/me/conversations",
      })
        .then((res) => {
          setGroupName("");
          setOpen(false);
          setLastestGroupCreated(res.data.conversation._id);
          socket.current.emit("new-group-conversation", {
            groupMembers: res.data.conversation.members,
            conversationId: res.data.conversation._id,
          });
        })
        .catch((err) => {
          console.log(err);
        });
  };

  const handleChange = (event) => {
    const { name, checked } = event.target;
    if (checked) setSelectedUsers((prevState) => [...prevState, name]);
    else
      setSelectedUsers((prevState) =>
        prevState.filter((userId) => userId !== name)
      );
  };

  return (
    <Dialog
      className="dialog"
      sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
    >
      <DialogTitle className="dialog-title">Select Group Members</DialogTitle>
      <DialogContent dividers className="dialog-content1">
        <TextField
          style={{ marginBottom: "10px" }}
          label="Group name"
          variant="standard"
          value={groupName}
          onChange={(e) => {
            setGroupName(e.target.value);
          }}
          required
        />
        <FormGroup>
          {allUsers.map((user, index) => (
            <FormControlLabel
              key={index}
              control={<Checkbox onChange={handleChange} name={user._id} />}
              label={user.name}
            />
          ))}
        </FormGroup>
      </DialogContent>
      <DialogActions className="dialog-actions">
        <Button className="dialog-actions" autoFocus onClick={handleCancel}>
          Cancel
        </Button>
        <Button className="dialog-actions" onClick={handleOk}>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NewGroupConversation;
