import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Menu, MenuItem, ListItemIcon, Typography } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.dir = lng === 'ar' ? 'rtl' : 'ltr';
    handleClose();
  };

  return (
    <>
      <Button
        variant="outlined"
        color="inherit"
        startIcon={<LanguageIcon />}
        onClick={handleClick}
        sx={{
          borderColor: 'rgba(255, 255, 255, 0.5)',
          '&:hover': {
            borderColor: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
          minWidth: 120,
          justifyContent: 'space-between',
          px: 2
        }}
      >
        <Typography sx={{ ml: 1 }}>
          {i18n.language === 'ar' ? 'العربية' : 'English'}
        </Typography>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 120,
          }
        }}
      >
        <MenuItem 
          onClick={() => changeLanguage('en')}
          sx={{
            py: 1,
            px: 2,
            '&:hover': {
              backgroundColor: 'action.hover',
            }
          }}
        >
          <ListItemIcon>
            <LanguageIcon fontSize="small" />
          </ListItemIcon>
          English
        </MenuItem>
        <MenuItem 
          onClick={() => changeLanguage('ar')}
          sx={{
            py: 1,
            px: 2,
            '&:hover': {
              backgroundColor: 'action.hover',
            }
          }}
        >
          <ListItemIcon>
            <LanguageIcon fontSize="small" />
          </ListItemIcon>
          العربية
        </MenuItem>
      </Menu>
    </>
  );
};

export default LanguageSwitcher;
