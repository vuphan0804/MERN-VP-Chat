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
} from "@mui/material";
import { GROUP_MESSAGE } from "../../../../constants/conversation";
const axios = require("axios");

function ConfirmationDialogRaw(props) {
  const { open, setOpen, allUsers, token } = props;

  const [selectedUsers, setSelectedUsers] = useState([]);

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
        },
        url: "/api/me/conversations",
      })
        .then((res) => {
          console.log(res.data);
          setOpen(false);
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
      sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
    >
      <DialogTitle>Select Group Members</DialogTitle>
      <DialogContent dividers>
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
      <DialogActions>
        <Button autoFocus onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleOk}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmationDialogRaw;
