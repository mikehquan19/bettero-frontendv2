'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Stack, Typography, Button } from '@mui/material';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Accounts', href: '/accounts' },
    { name: 'Summary', href: '/summary' },
    { name: 'Budget', href: '/budget' },
  ];

  return (
    <Box className="w-[160] h-[100vh] fixed bg-gray-400 text-white p-2 text-center">
      <Typography variant="h6" fontWeight="bold">
        <Link href="/" className="no-underline text-inherit">
          Bettero App
        </Link>
      </Typography>
      <Stack spacing={2} className="mt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.href}
              component={Link}
              href={item.href}
              fullWidth
              className={`justify-center rounded-lg font-${
                isActive ? 'bold' : 'normal'
              } bg-${
                isActive ? 'gray-500' : 'transparent'
              } text-white hover:bg-gray-500`}
            >
              {item.name}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
}
