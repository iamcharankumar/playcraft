import React, { useState } from 'react';
import { Play, SunMoon } from 'lucide-react';
import { ActionIcon, Tabs, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import PlayCraftLogoDark from '../assets/logo_dark.png';
import PlayCraftLogoLight from '../assets/logo_light.png';
import { CodeEditor } from '../components/CodeEditor';
import TerminalLog from '../components/TerminalLog';
import { customColors } from '../theme';

const DEFAULT_CODE = `
await page.goto('https://www.playwright.dev', { waitUntil: 'networkidle' });
console.log('Page loaded', await page.title());
`;

const logo = (colorScheme: 'dark' | 'light') => {
  const img = colorScheme === 'dark' ? PlayCraftLogoDark : PlayCraftLogoLight;
  const width = colorScheme === 'dark' ? 90 : 100;

  return <img src={img} alt="PlayCraft Logo" width={width} height={'auto'} />;
};

export function CodePanelPage() {
  const colorScheme = useComputedColorScheme('dark');
  const { colorScheme: mantineColorScheme, setColorScheme } = useMantineColorScheme();
  const [code, setCode] = useState(DEFAULT_CODE.trim());

  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: customColors.background[colorScheme],
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '60px',
          background: customColors.secondaryBg[colorScheme],
          borderBottom: `1px solid ${customColors.border[colorScheme]}`,
          padding: '20px 0 20px 0',
          justifyContent: 'space-between',
        }}
      >
        {logo(colorScheme)}
        <ActionIcon
          variant="subtle"
          size={32}
          style={{
            marginRight: 24,
            color: customColors.icon[colorScheme],
            background: customColors.iconBg[colorScheme],
            border: `1px solid ${customColors.border[colorScheme]}`,
            boxShadow: '0 1px 4px 0 rgba(60,60,60,0.08)',
            transition: 'background 0.15s, box-shadow 0.15s, border-color 0.15s',
          }}
          onClick={() => setColorScheme(mantineColorScheme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle color scheme"
        >
          <SunMoon size={20} />
        </ActionIcon>
      </div>

      {/* Editor Container */}
      <div
        style={{
          height: 'calc(100vh - 100px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CodeEditor
          code={code}
          onCodeChange={(value) => setCode(value ?? '')}
          colorScheme={colorScheme}
          onPlayClick={() => {
            /* TODO: handle play click */
          }}
        />
        {/* Tabs for Terminal, Mock, Network, Console */}
        <div
          style={{
            background: customColors.secondaryBg[colorScheme],
            height: '100%',
          }}
        >
          <Tabs
            defaultValue="terminal"
            color="blue"
            keepMounted={false}
            style={{
              height: '100%',
            }}
          >
            <Tabs.List>
              <Tabs.Tab value="terminal">Terminal</Tabs.Tab>
              <Tabs.Tab value="mock">Mock</Tabs.Tab>
              <Tabs.Tab value="network">Network</Tabs.Tab>
              <Tabs.Tab value="console">Console</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel
              value="terminal"
              style={{
                width: '100%',
                height: '100%',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'transparent',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    fontFamily: 'Fira Mono, monospace',
                    fontSize: 12,
                    background: customColors.secondaryBg[colorScheme],
                    color: customColors.text[colorScheme],
                    borderRadius: 0,
                  }}
                >
                  <TerminalLog
                    logs={[
                      <span>
                        <span style={{ color: customColors.text['dark'] }}>
                          Welcome to <b>PlayCraft Terminal</b>!<br />
                          Execution logs will appear here.
                          <br />
                        </span>
                      </span>,
                      // Example log lines:
                      <span style={{ color: customColors.text['dark'] }}>
                        Execution started...
                      </span>,
                      <span style={{ color: customColors.text['dark'] }}>
                        Execution finished successfully! Execution finished successfully! Execution
                        finished successfully! Execution finished successfully! Execution finished
                        successfully!
                      </span>,
                    ]}
                  />
                </div>
              </div>
            </Tabs.Panel>
            <Tabs.Panel value="mock" pt="xs">
              <div style={{ padding: 16, color: customColors.text[colorScheme] }}>
                Mock placeholder
              </div>
            </Tabs.Panel>
            <Tabs.Panel value="network" pt="xs">
              <div style={{ padding: 16, color: customColors.text[colorScheme] }}>
                Network placeholder
              </div>
            </Tabs.Panel>
            <Tabs.Panel value="console" pt="xs">
              <div style={{ padding: 16, color: customColors.text[colorScheme] }}>
                Console placeholder
              </div>
            </Tabs.Panel>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
