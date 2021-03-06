import { UnstyledButton } from '@mantine/core';
// import Dashboard from '@mui/icons-material/Dashboard';
import Info from '@mui/icons-material/Info';
import Logout from '@mui/icons-material/Logout';
// import MenuIcon from '@mui/icons-material/Menu';
import Settings from '@mui/icons-material/Settings';
import Star from '@mui/icons-material/Star';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { MouseEvent, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const pages = ['about'];

const Navbar = () => {
  const { user, signOut } = useAuth();

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  // const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
  //   setAnchorElNav(event.currentTarget);
  // };
  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  let rightSide;

  if (user) {
    rightSide = (
      <Box sx={{ flexGrow: 0 }}>
        <Tooltip title="Open dropdown">
          <IconButton
            onClick={handleOpenUserMenu}
            id="user-ison-button"
            aria-controls={Boolean(anchorElUser) ? 'user-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={Boolean(anchorElUser) ? 'true' : undefined}
          >
            <Avatar alt={user?.username!} src={user?.profilePic!} />
          </IconButton>
        </Tooltip>
        <Menu
          id="user-menu"
          anchorEl={anchorElUser}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
        >
          <Typography
            variant="h6"
            component="div"
            color="primary"
            sx={{ mx: '1rem', mb: '0.45rem' }}
          >
            {user.username}
          </Typography>
          <Divider />
          {/* <Link href="/dashboard" passHref={true}>
            <MenuItem sx={{ mt: '0.45rem' }}>
              <ListItemIcon>
                <Dashboard fontSize="small" />
              </ListItemIcon>
              My Dashboard
            </MenuItem>
          </Link>
          <Divider /> */}
          <Link href="/settings" passHref={true}>
            <MenuItem sx={{ marginTop: '0.5rem' }}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
          </Link>
          <Divider />
          <MenuItem onClick={() => signOut()}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Box>
    );
  } else {
    rightSide = (
      <Box sx={{ flexGrow: 0 }}>
        <Link href="/sign-in" passHref={true}>
          <Button variant="contained" color="secondary">
            Sign In
          </Button>
        </Link>
      </Box>
    );
  }

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Link href="/" passHref>
            <UnstyledButton>
              <Typography
                variant="h5"
                noWrap
                component="div"
                sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
                color={'primary'}
              >
                PomoFriends
              </Typography>
            </UnstyledButton>
          </Link>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            {/* <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="nav-menu"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton> */}
            <Link href="/" passHref>
              <UnstyledButton>
                <Typography
                  variant="h5"
                  noWrap
                  component="div"
                  sx={{ mr: 2, display: { xs: 'flex', md: 'none' } }}
                  color={'primary'}
                >
                  PomoFriends
                </Typography>
              </UnstyledButton>
            </Link>
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              {pages.map((page) => (
                <Link key={page} href={`/${page}`} passHref={true}>
                  <Button onClick={handleCloseNavMenu} sx={{ my: 2 }}>
                    {page}
                  </Button>
                </Link>
              ))}
            </Box>
            <Menu
              id="nav-menu"
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
            >
              <MenuItem>
                <ListItemIcon>
                  <Star fontSize="small" />
                </ListItemIcon>
                Rating
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <Info fontSize="small" />
                </ListItemIcon>
                About
              </MenuItem>
            </Menu>
          </Box>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Link key={page} href={`/${page}`} passHref={true}>
                <Button onClick={handleCloseNavMenu} sx={{ my: 2 }}>
                  {page}
                </Button>
              </Link>
            ))}
          </Box>
          {rightSide}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
