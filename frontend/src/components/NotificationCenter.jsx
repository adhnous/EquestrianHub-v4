import React, { useState } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Event as EventIcon,
  EmojiEvents as CompetitionIcon,
  School as TrainingIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { format } from 'date-fns';

const NotificationCenter = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const { data: notifications = [] } = useQuery('notifications', async () => {
    // TODO: Implement notification fetching
    return [
      {
        id: 1,
        type: 'training',
        message: 'Training session scheduled for tomorrow',
        date: new Date(),
        read: false,
      },
      {
        id: 2,
        type: 'competition',
        message: 'New competition registration open',
        date: new Date(),
        read: true,
      },
    ];
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'event':
        return <EventIcon color="primary" />;
      case 'competition':
        return <CompetitionIcon color="secondary" />;
      case 'training':
        return <TrainingIcon color="info" />;
      default:
        return <NotificationsIcon color="action" />;
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="large"
        aria-label="show notifications"
        color="inherit"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 400,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <MenuItem key={notification.id} onClick={handleClose}>
                <ListItemIcon>
                  {getIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={notification.message}
                  secondary={format(notification.date, 'PPp')}
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: notification.read ? 'text.secondary' : 'text.primary',
                  }}
                />
              </MenuItem>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary="No notifications"
                primaryTypographyProps={{
                  variant: 'body2',
                  color: 'text.secondary',
                  align: 'center',
                }}
              />
            </ListItem>
          )}
        </List>
      </Menu>
    </>
  );
};

export default NotificationCenter;
