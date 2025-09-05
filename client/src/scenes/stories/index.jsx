import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import { useSelector } from 'react-redux';
import Dropzone from 'react-dropzone';
import CloseIcon from '@mui/icons-material/Close';
import Navbar from 'scenes/navbar';
import api from '../../axiosInstance';
import socket from '../../socket';
import { Chart } from 'chart.js/auto';
import YouTube from 'react-youtube';

// --- Re-integrated MoodChart Component (Now Theme-Aware) ---
const MoodChart = ({ analysis }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const theme = useTheme(); // Access theme at the top level

  useEffect(() => {
    if (!analysis || !chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Positivity (Valence)', 'Energy', 'Danceability'],
        datasets: [{
          label: 'Image Mood',
          data: [analysis.valence, analysis.energy, analysis.danceability],
          fill: true,
          backgroundColor: theme.palette.primary.light + '33', // Use theme color with alpha
          borderColor: theme.palette.primary.main,
          pointBackgroundColor: theme.palette.primary.main,
          pointBorderColor: theme.palette.background.alt,
          pointHoverBackgroundColor: theme.palette.background.alt,
          pointHoverBorderColor: theme.palette.primary.main,
        }],
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: theme.palette.neutral.light },
            grid: { color: theme.palette.neutral.light },
            pointLabels: { font: { size: 12, weight: '500' }, color: theme.palette.text.secondary },
            ticks: {
              backdropColor: 'rgba(0, 0, 0, 0)',
              color: theme.palette.text.secondary,
              stepSize: 0.25,
            },
            suggestedMin: 0,
            suggestedMax: 1,
          },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [analysis, theme]);

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 320, height: 280, mx: 'auto' }}>
      <canvas ref={chartRef}></canvas>
    </Box>
  );
};

const StoriesPage = () => {
  const [stories, setStories] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('mood');
  const [error, setError] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const user = useSelector((state) => state.user);
  const { palette } = useTheme();
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

  useEffect(() => {
    fetchStories();
    socket.on('newStory', (newStory) => {
        setStories((prev) => [newStory, ...prev]);
    });
    socket.on('storyExpired', (storyId) => {
      setStories((prev) => prev.filter((s) => s._id !== storyId));
    });
    return () => {
        socket.off('newStory');
        socket.off('storyExpired');
    }
  }, []);

  const fetchStories = async () => {
    try {
      const res = await api.get('/stories');
      setStories(res.data);
    } catch (err) {
      console.error('Error fetching stories:', err);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const analyzeImageWithGemini = async (base64ImageData) => {
    const prompt = `Analyze the mood, theme, and energy of this image. Based on your analysis, provide ONLY a JSON object with the following keys: 'valence' (a score from 0.0 to 1.0 indicating happiness/positivity), 'energy' (a score from 0.0 to 1.0 for intensity/activity), and 'danceability' (a score from 0.0 to 1.0 for how much it makes you want to move). Do not include any text before or after the JSON object.`;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            { inline_data: { mime_type: 'image/jpeg', data: base64ImageData } },
          ],
        },
      ],
      generationConfig: { responseMimeType: 'application/json' },
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("API Error Response (Mood Analysis):", errorBody);
        throw new Error(`API request for mood analysis failed with status ${response.status}`);
    }

    const result = await response.json();
    if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
        return JSON.parse(result.candidates[0].content.parts[0].text);
    } else {
        console.error("Unexpected API response (Mood Analysis):", result);
        throw new Error('Unexpected API response structure for mood analysis');
    }
  };

  const getSongRecommendations = async (moodVector) => {
    const valenceNum = parseFloat(moodVector.valence);
    const energyNum = parseFloat(moodVector.energy);
    const danceabilityNum = parseFloat(moodVector.danceability);

    if (isNaN(valenceNum) || isNaN(energyNum) || isNaN(danceabilityNum)) {
        throw new Error("Received invalid, non-numeric mood vector from analysis API.");
    }
      
    const prompt = `
        You are an expert music curator for social media. An image has been analyzed and has the following mood profile:
        - Valence (Happiness): ${valenceNum.toFixed(2)}
        - Energy: ${energyNum.toFixed(2)}
        - Danceability: ${danceabilityNum.toFixed(2)}

        Based on this profile, perform two tasks and return the result as a single JSON object.
        1.  **moodMatches**: Generate a JSON array of 10 songs that perfectly match this mood. Include a mix of popular Hindi and global English songs. For each song, provide 'song_name', 'artist', and a 'similarity' score from 0.0 to 1.0.
        2.  **communityPicks**: Generate a second JSON array of 5 songs that are popularly associated with this vibe, as if simulating community trends. For each song, provide 'song_name', 'artist', and a 'picks' count (a number between 10 and 500).

        Return ONLY the final JSON object with the keys "moodMatches" and "communityPicks". Do not include any other text.
    `;
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("API Error Response (Song Recs):", errorBody);
        throw new Error(`API request for song recommendations failed with status ${response.status}`);
    }

    const result = await response.json();
    if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
        return JSON.parse(result.candidates[0].content.parts[0].text);
    } else {
        console.error("Unexpected API response (Song Recs):", result);
        throw new Error('Unexpected API response structure for song recommendations');
    }
  };

  const handleSuggestMusic = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);
    setResults(null);
    setSelectedSong(null);
    try {
      const base64 = await convertToBase64(image);
      const mood = await analyzeImageWithGemini(base64);
      const recommendations = await getSongRecommendations(mood);
      
      const moodMatches = (recommendations.moodMatches || []).sort((a, b) => b.similarity - a.similarity);
      const communityPicks = (recommendations.communityPicks || []).sort((a, b) => b.picks - a.picks);

      setResults({
        imageVector: mood,
        moodMatches,
        communityPicks,
      });
    } catch (err) {
      console.error('Error suggesting music:', err);
      setError('Failed to analyze and suggest music. Please try another image.');
      setResults(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetUpload = () => {
    setImage(null);
    setImagePreview(null);
    setResults(null);
    setActiveTab('mood');
    setError(null);
    setSelectedSong(null);
  };

  const handleImageDrop = (files) => {
    const file = files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setResults(null);
    setError(null);
    setSelectedSong(null);
  };

  const uploadStory = async () => {
    if (!image || !user?._id) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('userId', user._id);
      formData.append('picture', image);
      
      if (selectedSong) {
        formData.append('song', JSON.stringify(selectedSong));
      }
      
      await api.post('/stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      resetUpload();
    } catch (error) {
      console.error('Error uploading story:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleStoryClick = (story) => {
    setIsPlayerReady(false);
    setSelectedStory(story);
  };

  return (
    <Box>
      <Navbar />

      {/* Upload Section */}
      <Box p="1rem" borderBottom={`1px solid ${palette.divider}`} bgcolor={palette.background.alt}>
        <Typography variant="h5" color={palette.text.primary}>Add Story</Typography>
        <Dropzone
          acceptedFiles=".jpg,.jpeg,.png"
          multiple={false}
          onDrop={handleImageDrop}
        >
          {({ getRootProps, getInputProps }) => (
            <Box
              {...getRootProps()}
              p="1rem"
              mt="0.5rem"
              borderRadius="10px"
              sx={{ 
                cursor: 'pointer',
                border: `2px dashed ${palette.neutral.medium}`,
                bgcolor: palette.background.default,
                '&:hover': {
                    bgcolor: palette.action.hover
                }
              }}
            >
              <input {...getInputProps()} />
              <Typography color={palette.text.secondary}>
                {image ? image.name : 'Click or drag image to upload'}
              </Typography>
            </Box>
          )}
        </Dropzone>

        {imagePreview && (
          <Box mt={2}>
            <Box position="relative" width="fit-content">
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: '150px', height: 'auto', borderRadius: '8px' }}
              />
              <IconButton
                onClick={resetUpload}
                sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
              >
                <CloseIcon fontSize="small"/>
              </IconButton>
            </Box>

            <Button
              variant="contained"
              onClick={handleSuggestMusic}
              disabled={isAnalyzing}
              sx={{ mt: 1, mr: 1, bgcolor: palette.primary.main, color: palette.background.alt }}
            >
              {isAnalyzing ? <CircularProgress size={24} /> : 'Suggest Music with AI'}
            </Button>
            
            <Button
              onClick={uploadStory}
              disabled={uploading || !image}
              variant="contained"
              color="primary"
              sx={{ mt: 1 }}
            >
              {uploading ? <CircularProgress size={24} color="inherit" /> : 'Upload Story'}
            </Button>
          </Box>
        )}

        {error && (
          <Typography color="error.main" mt={2}>
            {error}
          </Typography>
        )}

        {results && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              border: `1px solid ${palette.divider}`,
              borderRadius: 2,
              bgcolor: palette.background.paper,
            }}
          >
            <Typography variant="h6" textAlign="center" mb={1}>AI Suggestions</Typography>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              centered
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab label="Mood Match" value="mood" />
              <Tab label="Community Picks" value="community" />
            </Tabs>

            {activeTab === 'mood' && (
              <Box mt={2}>
                <MoodChart analysis={results.imageVector} />
                {results.moodMatches.map((song, idx) => (
                  <Button
                    key={`${song.song_name}-${idx}`}
                    fullWidth
                    variant={selectedSong?.song_name === song.song_name ? "contained" : "outlined"}
                    onClick={() => setSelectedSong(song)}
                    sx={{ mt: 1, justifyContent: 'space-between', textTransform: 'none' }}
                  >
                    <span>🎵 {song.song_name} - {song.artist}</span>
                    <span>{(song.similarity * 100).toFixed(0)}%</span>
                  </Button>
                ))}
              </Box>
            )}

            {activeTab === 'community' && (
              <Box mt={2}>
                 {results.communityPicks.map((song, idx) => (
                  <Button
                    key={`${song.song_name}-${idx}`}
                    fullWidth
                    variant={selectedSong?.song_name === song.song_name ? "contained" : "outlined"}
                    onClick={() => setSelectedSong(song)}
                    sx={{ mt: 1, justifyContent: 'space-between', textTransform: 'none' }}
                  >
                    <span>🎵 {song.song_name} - {song.artist}</span>
                    <span>{song.picks} picks</span>
                  </Button>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Stories List */}
      <Box p="1rem">
        <Typography variant="h5" mb="1rem">User Stories</Typography>
        {stories.length === 0 ? (
          <Typography>No stories to display.</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'start' }}>
            {stories.map((story) => (
              <Box
                key={story._id}
                sx={{
                  width: 150,
                  height: 250,
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: 3,
                  cursor: 'pointer',
                }}
                onClick={() => handleStoryClick(story)}
              >
                <img
                  src={`${process.env.REACT_APP_API_BASE_URL}${story.mediaUrl}`}
                  alt="story"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {story.userId && (
                    <Avatar
                        src={`${process.env.REACT_APP_API_BASE_URL}${story.userId.picturePath}`}
                        alt={story.userId.firstName}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            width: 32,
                            height: 32,
                            border: '2px solid white',
                        }}
                    />
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Selected Story Dialog */}
      {selectedStory && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)',
            p: 2, 
          }}
          onClick={() => setSelectedStory(null)}
        >
          <Box
            sx={{
              position: 'relative',
              bgcolor: palette.background.default,
              color: palette.text.primary,
              borderRadius: 4,
              width: 'auto', 
              height: '90vh', 
              aspectRatio: '9 / 16',
              maxWidth: '90vw', 
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedStory.song && selectedStory.song.youtubeVideoId && (
              <YouTube
                videoId={selectedStory.song.youtubeVideoId}
                opts={{
                  height: '0',
                  width: '0',
                  playerVars: {
                    autoplay: 1,
                    controls: 0,
                  },
                }}
                onReady={() => setIsPlayerReady(true)}
                style={{ display: 'none' }}
              />
            )}
            <IconButton
              onClick={() => setSelectedStory(null)}
              sx={{ 
                position: 'absolute', 
                top: 12, 
                right: 12, 
                zIndex: 10,
                color: palette.mode === 'dark' ? 'white' : 'black',
                bgcolor: palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.7)',
                '&:hover': {
                  bgcolor: palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
            
            <Box p={2} pb={1.5} sx={{ 
                bgcolor: palette.background.paper,
                borderBottom: `1px solid ${palette.divider}`
              }}>
              {selectedStory.userId && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                      src={`${process.env.REACT_APP_API_BASE_URL}${selectedStory.userId.picturePath}`}
                      alt={selectedStory.userId.firstName}
                      sx={{ width: 32, height: 32 }}
                  />
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                  >
                    {selectedStory.userId.firstName} {selectedStory.userId.lastName}
                  </Typography>
                </Box>
              )}
              {selectedStory.song && (
                <Box 
                  sx={{
                    mt: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  {!isPlayerReady && selectedStory.song.youtubeVideoId ? (
                     <CircularProgress size={16} sx={{ mr: 1 }} />
                  ) : (
                    <Typography variant="h6" component="span" sx={{ color: 'text.secondary' }}>🎵</Typography>
                  )}
                  <Box>
                    <Typography variant="caption" display="block" lineHeight={1.2} fontWeight="600">
                      {selectedStory.song.song_name}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary" lineHeight={1.2}>
                      {selectedStory.song.artist}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            <Box sx={{
              width: '100%',
              flexGrow: 1,
              bgcolor: 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <img
                src={`${process.env.REACT_APP_API_BASE_URL}${selectedStory.mediaUrl}`}
                alt="Selected Story"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default StoriesPage;
