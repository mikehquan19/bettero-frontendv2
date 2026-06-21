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
    <Box className="w-[160] h-[100vh] fixed bg-blue-900 text-white p-2 text-center">
      <Typography variant="h6" fontWeight="bold">
        <Link href="/" className="no-underline text-inherit">
          Bettero App
        </Link>
      </Typography>
      <Stack spacing={2} className="mt-2">
        {navItems.map((item) => (
          <Button
            key={item.href}
            component={Link}
            href={item.href}
            fullWidth
            className={`justify-center rounded-lg font-${
              pathname === item.href ? 'bold' : 'normal'
            } bg-${
              pathname === item.href ? 'blue-700' : 'transparent'
            } text-white hover:bg-blue-700`}
          >
            {item.name}
          </Button>
        ))}
      </Stack>
    </Box>
  );
}
