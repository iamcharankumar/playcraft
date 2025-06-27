import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Globe, RefreshCw, RulerDimensionLine, SquareDashedMousePointer } from 'lucide-react';
import { ActionIcon, Button, Group, Menu, Modal, NumberInput, rem, TextInput, useComputedColorScheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { navigateToUrl } from '../apiService';
import { customColors } from '../theme';

const DEVICES = [
  { name: 'Responsive', width: '100%', height: '100%' },
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone XR', width: 414, height: 896 },
  { name: 'iPhone 12 Pro', width: 390, height: 844 },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
  { name: 'Pixel 7', width: 412, height: 915 },
  { name: 'Samsung Galaxy S8+', width: 360, height: 740 },
  { name: 'Samsung Galaxy S20 Ultra', width: 412, height: 915 },
  { name: 'iPad Mini', width: 768, height: 1024 },
  { name: 'iPad Air', width: 820, height: 1180 },
  { name: 'iPad Pro', width: 1024, height: 1366 },
  { name: 'Surface Pro 7', width: 912, height: 1368 },
  { name: 'Surface Duo', width: 540, height: 720 },
  { name: 'Galaxy Z Fold 5', width: 653, height: 841 },
  { name: 'Asus Zenbook Fold', width: 1280, height: 1800 },
  { name: 'Samsung Galaxy A51/71', width: 412, height: 915 },
  { name: 'Nest Hub', width: 1024, height: 600 },
  { name: 'Nest Hub Max', width: 1280, height: 800 },
  { name: 'MacBook Pro 16"', width: 1536, height: 960 },
  { name: 'UltraWide Monitor', width: 2560, height: 1080 },
  { name: 'Custom...', width: null, height: null },
];

export function AutomationFrame() {
  const [url, setUrl] = useState((window as any).APP_URL || 'https://www.playwright.dev');
  const [inputUrl, setInputUrl] = useState(url);
  const [history, setHistory] = useState([url]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState(DEVICES[0]);
  const [customWidth, setCustomWidth] = useState(375);
  const [customHeight, setCustomHeight] = useState(667);
  const [customOpen, { open: openCustom, close: closeCustom }] = useDisclosure(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [responsiveSize, setResponsiveSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const colorScheme = useComputedColorScheme('light') as 'light' | 'dark';
  const [loading, setLoading] = useState(true);

  const goToUrl = (newUrl: string) => {
    setUrl(newUrl);
    setLoading(true);
    const newHistory = history.slice(0, historyIndex + 1).concat(newUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setUrl(history[historyIndex - 1]);
      setInputUrl(history[historyIndex - 1]);
      setLoading(true);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setUrl(history[historyIndex + 1]);
      setInputUrl(history[historyIndex + 1]);
      setLoading(true);
    }
  };

  const refresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = url;
      setLoading(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
  };

  const handleInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      let formattedUrl = inputUrl;
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }
      setLoading(true);
      const result = await navigateToUrl(formattedUrl);
      setLoading(false);
      if (result.error) {
        console.log(result.error);
      }
    }
  };

  const isResponsive = device.name === 'Responsive';
  const iframeWidth = isResponsive
    ? responsiveSize.width
    : device.width === '100%' || device.width == null
      ? '100%'
      : device.width;
  const iframeHeight = isResponsive
    ? responsiveSize.height
    : device.height === '100%' || device.height == null
      ? '100%'
      : device.height;
  const deviceWidth = isResponsive
    ? responsiveSize.width
    : device.width && device.width !== '100%'
      ? Number(device.width)
      : undefined;
  const deviceHeight = isResponsive
    ? responsiveSize.height
    : device.height && device.height !== '100%'
      ? Number(device.height)
      : undefined;

  // Calculate scale when device or container size changes
  useLayoutEffect(() => {
    function recalcScale() {
      if (!containerRef.current) return;
      const parentWidth = containerRef.current.offsetWidth;
      const parentHeight = containerRef.current.offsetHeight;
      const w = typeof iframeWidth === 'number' ? iframeWidth : Number(iframeWidth);
      const h = typeof iframeHeight === 'number' ? iframeHeight : Number(iframeHeight);
      if (!w || !h || isNaN(w) || isNaN(h)) {
        setScale(1);
        return;
      }
      const scaleW = parentWidth / w;
      const scaleH = parentHeight / h;
      setScale(Math.min(scaleW, scaleH, 1));
    }
    recalcScale();
    // Listen for container resize
    const ro = new window.ResizeObserver(recalcScale);
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    return () => {
      ro.disconnect();
    };
  }, [device, customWidth, customHeight, iframeWidth, iframeHeight]);

  // Update responsive size on window resize
  useEffect(() => {
    function handleResize() {
      setResponsiveSize({ width: window.innerWidth, height: window.innerHeight });
    }
    if (device.name === 'Responsive') {
      window.addEventListener('resize', handleResize);
      handleResize();
    }
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [device]);

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        background: customColors.background[colorScheme],
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        boxSizing: 'border-box',
        padding: 10, // more breathing room
      }}
    >
      {/* Browser header - always full width */}
      <div
        style={{
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto 10px auto',
          background: customColors.secondaryBg[colorScheme],
          borderRadius: 0,
          boxShadow: '0 1px 4px 0 rgba(60,60,60,0.04)',
          border: `1px solid ${customColors.border[colorScheme]}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minHeight: 50,
          padding: '0.25rem 0.5rem',
          boxSizing: 'border-box',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Group gap={2}>
          <ActionIcon
            variant="subtle"
            onClick={goBack}
            disabled={historyIndex === 0}
            size={32}
            style={{
              borderRadius: 8,
              transition: 'background 0.15s',
              background: 'transparent',
              color:
                historyIndex === 0
                  ? customColors.iconDisabled[colorScheme]
                  : customColors.icon[colorScheme],
            }}
          >
            <ArrowLeft size={18} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            onClick={goForward}
            disabled={historyIndex === history.length - 1}
            size={32}
            style={{
              borderRadius: 8,
              transition: 'background 0.15s',
              background: 'transparent',
              color:
                historyIndex === history.length - 1
                  ? customColors.iconDisabled[colorScheme]
                  : customColors.icon[colorScheme],
            }}
          >
            <ArrowRight size={18} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            onClick={refresh}
            size={32}
            style={{
              borderRadius: 8,
              transition: 'background 0.15s',
              color: customColors.icon[colorScheme],
            }}
          >
            <RefreshCw size={18} />
          </ActionIcon>
        </Group>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TextInput
            type="url"
            value={inputUrl}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder="Enter URL"
            leftSection={<Globe size={14} style={{ color: customColors.icon[colorScheme] }} />}
            style={{
              flex: 1,
              minWidth: rem(200),
              boxShadow: 'none',
              fontSize: 20,
              color: customColors.icon[colorScheme],
              outline: 'none',
              background: 'transparent',
            }}
            size={'sm'}
            radius={8}
            autoComplete="off"
          />
          <Menu shadow="md" width={220}>
            <Menu.Target>
              <ActionIcon
                variant="light"
                radius={8}
                size={36}
                style={{
                  marginLeft: 4,
                  border: `1px solid ${customColors.border[colorScheme]}`,
                  background: customColors.secondaryBg[colorScheme],
                  color: customColors.icon[colorScheme],
                  boxShadow: '0 1px 4px 0 rgba(60,60,60,0.08)',
                  transition: 'background 0.15s, box-shadow 0.15s, border-color 0.15s',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = customColors.iconBg[colorScheme];
                  e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(60,60,60,0.12)';
                  e.currentTarget.style.borderColor = customColors.icon[colorScheme];
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = customColors.secondaryBg[colorScheme];
                  e.currentTarget.style.boxShadow = '0 1px 4px 0 rgba(60,60,60,0.08)';
                  e.currentTarget.style.borderColor = customColors.border[colorScheme];
                }}
              >
                <RulerDimensionLine size={20} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {DEVICES.map((d) => (
                <Menu.Item
                  key={d.name}
                  onClick={() => {
                    if (d.name === 'Custom...') {
                      openCustom();
                    } else {
                      setDevice(d);
                    }
                  }}
                  rightSection={device.name === d.name ? '✓' : undefined}
                >
                  {d.name}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
          <ActionIcon
            variant="light"
            radius={8}
            size={36}
            style={{
              marginLeft: 4,
              border: `1px solid ${customColors.border[colorScheme]}`,
              background: customColors.secondaryBg[colorScheme],
              color: customColors.icon[colorScheme],
              boxShadow: '0 1px 4px 0 rgba(60,60,60,0.08)',
              transition: 'background 0.15s, box-shadow 0.15s, border-color 0.15s',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = customColors.iconBg[colorScheme];
              e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(60,60,60,0.12)';
              e.currentTarget.style.borderColor = customColors.icon[colorScheme];
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = customColors.secondaryBg[colorScheme];
              e.currentTarget.style.boxShadow = '0 1px 4px 0 rgba(60,60,60,0.08)';
              e.currentTarget.style.borderColor = customColors.border[colorScheme];
            }}
          >
            <SquareDashedMousePointer size={20} />
          </ActionIcon>
        </div>
      </div>
      {/* Device viewport container - resizes with device */}
      <div
        ref={containerRef}
        style={{
          overflow: 'hidden',
          height: '100%',
          width: '100%',
          maxWidth: 1200,
          maxHeight: '98%',
          minWidth: 320,
          minHeight: 320,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Loader overlay */}
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(255,255,255,0.7)',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              className="loader"
              style={{
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #555',
                borderRadius: '50%',
                width: 40,
                height: 40,
                animation: 'spin 1s linear infinite',
              }}
            />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={url}
          id="aut-frame"
          name="aut-frame"
          style={{
            boxShadow:
              '0 4px 32px 0 rgba(60, 60, 60, 0.10), 0 1.5px 8px 0 rgba(224, 201, 127, 0.10) inset',
            border: `1px solid ${customColors.border[colorScheme]}`,
            width: iframeWidth,
            height: iframeHeight,
            background: customColors.background[colorScheme],
            borderRadius: 0,
            transition: 'background 0.2s',
            display: 'block',
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            position: 'absolute',
            top: 0,
            marginTop: 0,
          }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          onLoad={() => setLoading(false)}
        />
      </div>
      <Modal opened={customOpen} onClose={closeCustom} title="Custom Resolution" centered>
        <NumberInput
          label="Width (px)"
          value={customWidth}
          onChange={(val) => setCustomWidth(Number(val))}
          min={100}
          max={3000}
          step={1}
          mb="md"
        />
        <NumberInput
          label="Height (px)"
          value={customHeight}
          onChange={(val) => setCustomHeight(Number(val))}
          min={100}
          max={3000}
          step={1}
          mb="md"
        />
        <Button
          fullWidth
          mt="md"
          onClick={() => {
            setDevice({
              name: `Custom (${customWidth}x${customHeight})`,
              width: customWidth,
              height: customHeight,
            });
            closeCustom();
          }}
        >
          Apply
        </Button>
      </Modal>
    </div>
  );
}