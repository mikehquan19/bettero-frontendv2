'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Stack, Typography, Button } from '@mui/material';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Summary', href: '/summary' },
    { name: 'Budget', href: '/budget' },
    { name: 'Investment', href: '/investment' },
  ];

  return (
    <Box
      sx={{
        width: 160,
        height: '100vh',
        position: 'fixed',
        bgcolor: 'grey.400',
        color: 'common.white',
        p: 2,
        textAlign: 'center',
      }}
    >
      <Typography variant="h6" fontWeight="bold">
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          Bettero App
        </Link>
      </Typography>
      <Stack spacing={2} mt={2}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Button
              key={item.href}
              component={Link}
              href={item.href}
              fullWidth
              sx={{
                justifyContent: 'center',
                borderRadius: 2,
                fontWeight: isActive ? 'bold' : 'normal',
                bgcolor: isActive ? 'grey.500' : 'transparent',
                color: 'white',
                '&:hover': {
                  bgcolor: 'grey.500',
                },
              }}
            >
              {item.name}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
}
