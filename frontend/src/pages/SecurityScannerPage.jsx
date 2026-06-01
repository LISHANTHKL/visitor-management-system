import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { verifyQrToken } from '../services/securityQrService.js';

const formatDate = (value) => {
  if (!value) return '-';

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(new Date(value));
};

const formatSlotLabel = (slot) => {
  if (!slot) return '-';

  const [hourValue, minuteValue] = slot.split(':').map(Number);
  const suffix = hourValue >= 12 ? 'PM' : 'AM';
  const hour = hourValue % 12 || 12;
  return `${String(hour).padStart(2, '0')}:${String(minuteValue).padStart(2, '0')} ${suffix}`;
};

const extractQrToken = (qrText) => {
  const rawValue = String(qrText || '').trim();

  if (!rawValue) {
    return '';
  }

  try {
    const payload = JSON.parse(rawValue);
    return String(payload.qrToken || '').trim();
  } catch (_error) {
    return rawValue;
  }
};

const DetailLine = ({ label, value }) => (
  <Box>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 700 }}>{value || '-'}</Typography>
  </Box>
);

const VerificationResult = ({ result }) => {
  if (!result) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
        <Stack spacing={1.5} alignItems="center" justifyContent="center" sx={{ minHeight: 260, textAlign: 'center' }}>
          <QrCodeScannerIcon color="action" sx={{ fontSize: 52 }} />
          <Typography variant="h6">Verification Result</Typography>
          <Typography color="text.secondary">
            Scan a visitor pass QR code or upload a QR image to verify it.
          </Typography>
        </Stack>
      </Paper>
    );
  }

  const isValid = result.valid;
  const request = result.request;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 2,
        height: '100%',
        borderColor: isValid ? 'success.main' : 'error.main',
        bgcolor: isValid ? 'rgba(46, 125, 50, 0.08)' : 'rgba(211, 47, 47, 0.08)'
      }}
    >
      <Stack spacing={2.5}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          {isValid ? <VerifiedUserIcon color="success" /> : <ErrorOutlineIcon color="error" />}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: isValid ? 'success.main' : 'error.main' }}>
              {isValid ? 'VALID PASS' : 'INVALID PASS'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {result.reason || result.code || 'Verification complete'}
            </Typography>
          </Box>
        </Stack>

        {request && (
          <>
            <Divider />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailLine label="Visitor Name" value={request.visitorName} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailLine label="Visitor Email" value={request.visitorEmail} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailLine label="Employee Name" value={request.employeeName} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailLine label="Department" value={request.department} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailLine label="Cabin Number" value={request.cabinNumber} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailLine label="Visit Date" value={formatDate(request.visitDate)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailLine label="Visit Time" value={formatSlotLabel(request.visitTime)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailLine label="Status" value={request.status} />
              </Grid>
            </Grid>
          </>
        )}
      </Stack>
    </Paper>
  );
};

const SecurityScannerPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const imageInputRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isScanningRef = useRef(false);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanError, setScanError] = useState('');
  const [result, setResult] = useState(null);

  const stopScanner = () => {
    isScanningRef.current = false;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
  };

  const verifyQrText = async (qrText) => {
    const qrToken = extractQrToken(qrText);

    if (!qrToken) {
      setResult({
        valid: false,
        code: 'INVALID_QR',
        reason: 'Invalid QR',
        request: null
      });
      return;
    }

    setIsVerifying(true);
    setScanError('');

    try {
      const verification = await verifyQrToken(qrToken);
      setResult(verification);
    } catch (requestError) {
      setResult(null);
      setScanError(requestError.response?.data?.message || 'Unable to verify QR code');
    } finally {
      setIsVerifying(false);
    }
  };

  const scanFrame = () => {
    if (!isScanningRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      const width = video.videoWidth;
      const height = video.videoHeight;

      if (width && height) {
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(video, 0, 0, width, height);

        const imageData = context.getImageData(0, 0, width, height);
        const code = jsQR(imageData.data, width, height);

        if (code?.data) {
          stopScanner();
          verifyQrText(code.data);
          return;
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  const startScanner = async () => {
    setScanError('');
    setResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment'
        },
        audio: false
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      isScanningRef.current = true;
      setIsCameraActive(true);
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    } catch (_error) {
      setScanError('Unable to access camera. Allow camera permission or use image upload.');
      stopScanner();
    }
  };

  const decodeImageFile = (file) =>
    new Promise((resolve, reject) => {
      const imageUrl = URL.createObjectURL(file);
      const image = new Image();

      image.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;

          const context = canvas.getContext('2d', { willReadFrequently: true });
          context.drawImage(image, 0, 0);

          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, canvas.width, canvas.height);
          URL.revokeObjectURL(imageUrl);

          if (!code?.data) {
            reject(new Error('No QR code found in this image'));
            return;
          }

          resolve(code.data);
        } catch (error) {
          URL.revokeObjectURL(imageUrl);
          reject(error);
        }
      };

      image.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error('Unable to read this image file'));
      };

      image.src = imageUrl;
    });

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    stopScanner();
    setScanError('');
    setResult(null);

    try {
      const qrText = await decodeImageFile(file);
      await verifyQrText(qrText);
    } catch (error) {
      setScanError(error.message || 'Unable to scan QR image');
    } finally {
      event.target.value = '';
    }
  };

  useEffect(() => () => stopScanner(), []);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          QR Scanner
        </Typography>
        <Typography color="text.secondary">
          Verify visitor pass QR codes using the camera or an uploaded QR image.
        </Typography>
      </Box>

      {scanError && <Alert severity="error" onClose={() => setScanError('')}>{scanError}</Alert>}

      <Grid container spacing={3} alignItems="stretch">
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CameraAltIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  QR Scanner
                </Typography>
              </Stack>

              <Box
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: 'grey.100',
                  aspectRatio: '4 / 3',
                  display: 'grid',
                  placeItems: 'center'
                }}
              >
                <Box
                  component="video"
                  ref={videoRef}
                  muted
                  playsInline
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: isCameraActive ? 'block' : 'none'
                  }}
                />
                {!isCameraActive && (
                  <Stack spacing={1} alignItems="center" sx={{ color: 'text.secondary', textAlign: 'center', px: 2 }}>
                    <QrCodeScannerIcon sx={{ fontSize: 56 }} />
                    <Typography>Camera preview will appear here</Typography>
                  </Stack>
                )}
                {isVerifying && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'rgba(255,255,255,0.72)',
                      display: 'grid',
                      placeItems: 'center'
                    }}
                  >
                    <CircularProgress />
                  </Box>
                )}
              </Box>
              <Box component="canvas" ref={canvasRef} sx={{ display: 'none' }} />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  variant="contained"
                  startIcon={<CameraAltIcon />}
                  onClick={startScanner}
                  disabled={isCameraActive || isVerifying}
                  fullWidth
                >
                  Start Camera
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<StopCircleIcon />}
                  onClick={stopScanner}
                  disabled={!isCameraActive}
                  fullWidth
                >
                  Stop
                </Button>
              </Stack>

              <Divider>
                <Chip label="or" size="small" />
              </Divider>

              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                disabled={isVerifying}
                fullWidth
              >
                Upload QR Image
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageUpload}
                />
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <VerificationResult result={result} />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default SecurityScannerPage;
