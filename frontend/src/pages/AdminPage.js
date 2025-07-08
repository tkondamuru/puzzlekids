import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, Save, Upload, Download, AlertCircle, CheckCircle, FileText, Code } from 'lucide-react';
import { toast } from 'sonner';

const AdminPage = () => {
  const [sasUrl, setSasUrl] = useState('');
  const [puzzleData, setPuzzleData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPuzzle, setEditingPuzzle] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);

  // SVG Processing state
  const [svgFile, setSvgFile] = useState(null);
  const [svgProcessing, setSvgProcessing] = useState(false);
  const [svgAnalysis, setSvgAnalysis] = useState(null);
  const [processedSvg, setProcessedSvg] = useState(null);

  // Load SAS URL from localStorage on component mount
  useEffect(() => {
    const storedSasUrl = localStorage.getItem('puzzlekids_sas_url');
    if (storedSasUrl) {
      setSasUrl(storedSasUrl);
    }
  }, []);

  // Function to save SAS URL to localStorage
  const saveSasUrlToStorage = (url) => {
    localStorage.setItem('puzzlekids_sas_url', url);
  };

  // Function to clear SAS URL from localStorage
  const clearSasUrlFromStorage = () => {
    localStorage.removeItem('puzzlekids_sas_url');
    setSasUrl('');
  };

  // Form state for editing/adding puzzles
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    pieces: '',
    level: 'Easy',
    tags: '',
    img: ''
  });

  useEffect(() => {
    // Extract all unique tags when puzzle data changes
    const tags = new Set();
    puzzleData.forEach(puzzle => {
      if (puzzle.tags) {
        puzzle.tags.split(',').forEach(tag => {
          tags.add(tag.trim());
        });
      }
    });
    setAllTags(Array.from(tags));
  }, [puzzleData]);

  const loadPuzzleData = async () => {
    if (!sasUrl.trim()) {
      toast.error('Please enter a valid SAS URL');
      return;
    }

    try {
      setLoading(true);
      const baseUrl = sasUrl.split('?')[0]; // Remove SAS token
      //const containerUrl = baseUrl.substring(0, baseUrl.lastIndexOf('/'));
      const carsJsonUrl = `${baseUrl}/cars.js?${sasUrl.split('?')[1]}`;

      const response = await fetch(carsJsonUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPuzzleData(data);
      
      // Save SAS URL to localStorage when data is successfully loaded
      saveSasUrlToStorage(sasUrl);
      
      toast.success(`Loaded ${data.length} puzzles successfully! SAS URL saved for future use.`);
    } catch (error) {
      console.error('Error loading puzzle data:', error);
      toast.error('Failed to load puzzle data. Please check your SAS URL.');
    } finally {
      setLoading(false);
    }
  };

  const savePuzzleData = async () => {
    if (!sasUrl.trim()) {
      toast.error('Please enter a valid SAS URL');
      return;
    }

    try {
      setLoading(true);
      const baseUrl = sasUrl.split('?')[0];
      const carsJsonUrl = `${baseUrl}/cars.js?${sasUrl.split('?')[1]}`;

      const response = await fetch(carsJsonUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-ms-blob-type': 'BlockBlob'
        },
        body: JSON.stringify(puzzleData, null, 2)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success('Puzzle data saved successfully!');
    } catch (error) {
      console.error('Error saving puzzle data:', error);
      toast.error('Failed to save puzzle data. Please check your SAS URL permissions.');
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file) => {
    if (!sasUrl.trim()) {
      toast.error('Please enter a valid SAS URL');
      return null;
    }

    try {
      setImageUploading(true);
      const baseUrl = sasUrl.split('?')[0];
      const fileName = `${Date.now()}_${file.name}`;
      const imageUrl = `${baseUrl}/${fileName}?${sasUrl.split('?')[1]}`;

      const response = await fetch(imageUrl, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.type
        },
        body: file
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const publicUrl = `${baseUrl}/${fileName}`;
      toast.success('Image uploaded successfully!');
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.includes('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setFormData(prev => ({ ...prev, img: imageUrl }));
    }
  };

  const openEditDialog = (puzzle = null) => {
    if (puzzle) {
      setEditingPuzzle(puzzle);
      setFormData({
        name: puzzle.name || '',
        desc: puzzle.desc || '',
        pieces: puzzle.pieces?.toString() || '',
        level: puzzle.level || 'Easy',
        tags: puzzle.tags || '',
        img: puzzle.img || ''
      });
    } else {
      setEditingPuzzle(null);
      setFormData({
        name: '',
        desc: '',
        pieces: '',
        level: 'Easy',
        tags: '',
        img: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSavePuzzle = () => {
    if (!formData.name.trim() || !formData.desc.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const puzzleToSave = {
      name: formData.name.trim(),
      desc: formData.desc.trim(),
      pieces: parseInt(formData.pieces) || 9,
      level: formData.level,
      tags: formData.tags.trim(),
      img: formData.img.trim()
    };

    if (editingPuzzle) {
      // Update existing puzzle
      const index = puzzleData.findIndex(p => p === editingPuzzle);
      const newData = [...puzzleData];
      newData[index] = puzzleToSave;
      setPuzzleData(newData);
      toast.success('Puzzle updated successfully!');
    } else {
      // Add new puzzle
      setPuzzleData([...puzzleData, puzzleToSave]);
      toast.success('Puzzle added successfully!');
    }

    setIsDialogOpen(false);
    setEditingPuzzle(null);
  };

  const handleDeletePuzzle = (puzzle) => {
    if (window.confirm('Are you sure you want to delete this puzzle?')) {
      setPuzzleData(puzzleData.filter(p => p !== puzzle));
      toast.success('Puzzle deleted successfully!');
    }
  };

  const getTagSuggestions = (inputValue) => {
    return allTags.filter(tag => 
      tag.toLowerCase().includes(inputValue.toLowerCase()) && 
      !formData.tags.split(',').map(t => t.trim()).includes(tag)
    );
  };

  // SVG Processing Functions
  const handleSvgFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.includes('svg')) {
      toast.error('Please select a valid SVG file');
      return;
    }

    setSvgFile(file);
    setSvgAnalysis(null);
    setProcessedSvg(null);
  };

  const analyzeSvg = async () => {
    if (!svgFile) {
      toast.error('Please upload an SVG file first');
      return;
    }

    try {
      setSvgProcessing(true);
      const text = await svgFile.text();
      
      // Parse SVG content
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'image/svg+xml');
      const svgElement = doc.querySelector('svg');
      
      if (!svgElement) {
        throw new Error('No SVG element found in file');
      }

      // Find all groups with IDs starting with 'g' followed by numbers
      const groups = Array.from(svgElement.querySelectorAll('[id^="g"]')).filter(el => {
        const id = el.getAttribute('id');
        return id && /^g\d+$/.test(id); // matches g1, g2, g3, etc.
      });

      const groupNumbers = groups.map(el => {
        const id = el.getAttribute('id');
        return parseInt(id.replace('g', ''));
      }).filter(num => !isNaN(num)).sort((a, b) => a - b);

      // Find existing target groups
      const existingTargets = Array.from(svgElement.querySelectorAll('[id^="t"]')).filter(el => {
        const id = el.getAttribute('id');
        return id && /^t\d+$/.test(id);
      });

      const existingTargetNumbers = existingTargets.map(el => {
        const id = el.getAttribute('id');
        return parseInt(id.replace('t', ''));
      }).filter(num => !isNaN(num));

      // Find missing target groups
      const missingTargets = groupNumbers.filter(num => !existingTargetNumbers.includes(num));

      const analysis = {
        totalGroups: groupNumbers.length,
        existingTargets: existingTargetNumbers.length,
        missingTargets: missingTargets.length,
        groupNumbers,
        existingTargetNumbers,
        missingTargetNumbers: missingTargets,
        svgContent: text
      };

      setSvgAnalysis(analysis);
      toast.success(`Analysis complete! Found ${groupNumbers.length} groups, ${missingTargets.length} missing targets`);
      
    } catch (error) {
      console.error('Error analyzing SVG:', error);
      toast.error('Failed to analyze SVG file');
    } finally {
      setSvgProcessing(false);
    }
  };

  const processSvg = async () => {
    if (!svgAnalysis) {
      toast.error('Please analyze the SVG first');
      return;
    }

    try {
      setSvgProcessing(true);
      
      // Parse the original SVG
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgAnalysis.svgContent, 'image/svg+xml');
      const svgElement = doc.querySelector('svg');
      
      if (!svgElement) {
        throw new Error('No SVG element found');
      }

      // Create missing target groups
      svgAnalysis.missingTargetNumbers.forEach(targetNum => {
        const sourceGroup = svgElement.querySelector(`#g${targetNum}`);
        if (sourceGroup) {
          // Clone the source group
          const targetGroup = sourceGroup.cloneNode(true);
          targetGroup.setAttribute('id', `t${targetNum}`);
          
          // Add to SVG root
          svgElement.appendChild(targetGroup);
        }
      });

      // Convert back to string
      const serializer = new XMLSerializer();
      const processedSvgContent = serializer.serializeToString(doc);
      
      setProcessedSvg(processedSvgContent);
      toast.success(`SVG processed! Added ${svgAnalysis.missingTargetNumbers.length} target groups`);
      
    } catch (error) {
      console.error('Error processing SVG:', error);
      toast.error('Failed to process SVG');
    } finally {
      setSvgProcessing(false);
    }
  };

  const downloadProcessedSvg = () => {
    if (!processedSvg) {
      toast.error('No processed SVG available');
      return;
    }

    const blob = new Blob([processedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = svgFile ? `processed_${svgFile.name}` : 'processed_puzzle.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Processed SVG downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30">
              <ArrowLeft className="mr-2" size={16} />
              Back to Home
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
              🔧 Admin Panel 🔧
            </h1>
            <p className="text-white/90 text-lg">
              Manage puzzle data and images
            </p>
          </div>
          
          <div className="w-32"></div>
        </div>

        {/* SAS URL Configuration */}
        <Card className="mb-6 bg-white/95 backdrop-blur-sm border-2 border-white/50">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <AlertCircle className="text-orange-500" />
              Azure Blob Storage Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Input
                  placeholder="Enter Azure Blob SAS URL (e.g., https://storage.blob.core.windows.net/container?sp=racwdl&st=...)"
                  value={sasUrl}
                  onChange={(e) => setSasUrl(e.target.value)}
                  className="text-sm"
                />
              </div>
              <Button 
                onClick={loadPuzzleData} 
                disabled={loading || !sasUrl.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="mr-2" size={16} />
                {loading ? 'Loading...' : 'Load Data'}
              </Button>
              {localStorage.getItem('puzzlekids_sas_url') && (
                <Button 
                  onClick={clearSasUrlFromStorage}
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  title="Clear saved SAS URL"
                >
                  Clear
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Enter your Azure Blob Storage SAS URL with read/write permissions to manage puzzle data. 
              The URL will be automatically saved when data is successfully loaded and restored on your next visit.
            </p>
          </CardContent>
        </Card>

        {/* Data Management */}
        {puzzleData.length > 0 && (
          <Card className="mb-6 bg-white/95 backdrop-blur-sm border-2 border-white/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <CheckCircle className="text-green-500" />
                  Puzzle Data Management ({puzzleData.length} puzzles)
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={() => openEditDialog()} className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="mr-2" size={16} />
                    Add Puzzle
                  </Button>
                  <Button onClick={savePuzzleData} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Save className="mr-2" size={16} />
                    {loading ? 'Saving...' : 'Save All Changes'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Pieces</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {puzzleData.map((puzzle, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{puzzle.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{puzzle.desc}</TableCell>
                        <TableCell>{puzzle.pieces}</TableCell>
                        <TableCell>
                          <Badge variant={puzzle.level === 'Easy' ? 'default' : puzzle.level === 'Medium' ? 'secondary' : 'destructive'}>
                            {puzzle.level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {puzzle.tags?.split(',').slice(0, 2).map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ))}
                            {puzzle.tags?.split(',').length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{puzzle.tags.split(',').length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {puzzle.img && (
                            <img src={puzzle.img} alt={puzzle.name} className="w-12 h-12 object-cover rounded" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => openEditDialog(puzzle)}
                            >
                              <Edit size={12} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDeletePuzzle(puzzle)}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SVG Processing Module */}
        <Card className="mb-6 bg-white/95 backdrop-blur-sm border-2 border-white/50">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Code className="text-blue-500" />
              SVG Puzzle Processor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Upload SVG File</label>
                <div className="flex gap-4 items-center">
                  <input
                    type="file"
                    accept=".svg"
                    onChange={handleSvgFileUpload}
                    className="hidden"
                    id="svg-upload"
                  />
                  <label htmlFor="svg-upload">
                    <Button variant="outline" disabled={svgProcessing} asChild>
                      <span>
                        <FileText className="mr-2" size={16} />
                        {svgFile ? svgFile.name : 'Choose SVG File'}
                      </span>
                    </Button>
                  </label>
                  {svgFile && (
                    <Button 
                      onClick={analyzeSvg} 
                      disabled={svgProcessing}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {svgProcessing ? 'Analyzing...' : 'Analyze SVG'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Analysis Results */}
              {svgAnalysis && (
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <h4 className="font-semibold text-gray-800 mb-3">Analysis Results</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{svgAnalysis.totalGroups}</div>
                      <div className="text-sm text-gray-600">Total Groups (g1, g2, ...)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{svgAnalysis.existingTargets}</div>
                      <div className="text-sm text-gray-600">Existing Targets (t1, t2, ...)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{svgAnalysis.missingTargets}</div>
                      <div className="text-sm text-gray-600">Missing Targets</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Group Numbers:</span>
                      <div className="flex flex-wrap gap-1">
                        {svgAnalysis.groupNumbers.map(num => (
                          <Badge key={num} variant="outline" className="text-xs">
                            g{num}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {svgAnalysis.missingTargetNumbers.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Missing Targets:</span>
                        <div className="flex flex-wrap gap-1">
                          {svgAnalysis.missingTargetNumbers.map(num => (
                            <Badge key={num} variant="destructive" className="text-xs">
                              t{num}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {svgAnalysis.missingTargets > 0 && (
                    <div className="mt-4">
                      <Button 
                        onClick={processSvg} 
                        disabled={svgProcessing}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {svgProcessing ? 'Processing...' : 'Generate Missing Targets'}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Download Processed SVG */}
              {processedSvg && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">SVG Processing Complete!</h4>
                  <p className="text-sm text-green-700 mb-3">
                    The SVG has been processed and {svgAnalysis?.missingTargets || 0} target groups have been added.
                  </p>
                  <Button 
                    onClick={downloadProcessedSvg}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Download className="mr-2" size={16} />
                    Download Processed SVG
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit/Add Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPuzzle ? 'Edit Puzzle' : 'Add New Puzzle'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter puzzle name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <Textarea
                  value={formData.desc}
                  onChange={(e) => setFormData(prev => ({ ...prev, desc: e.target.value }))}
                  placeholder="Enter puzzle description"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Pieces</label>
                  <Input
                    type="number"
                    value={formData.pieces}
                    onChange={(e) => setFormData(prev => ({ ...prev, pieces: e.target.value }))}
                    placeholder="9"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Level</label>
                  <Select value={formData.level} onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="easy,cars,trucks"
                />
                {allTags.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Existing tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {allTags.map(tag => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className="text-xs cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            const currentTags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
                            if (!currentTags.includes(tag)) {
                              setFormData(prev => ({ 
                                ...prev, 
                                tags: [...currentTags, tag].join(', ')
                              }));
                            }
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                <div className="space-y-2">
                  <Input
                    value={formData.img}
                    onChange={(e) => setFormData(prev => ({ ...prev, img: e.target.value }))}
                    placeholder="Enter image URL or upload below"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <Button type="button" variant="outline" disabled={imageUploading} asChild>
                        <span>
                          <Upload className="mr-2" size={16} />
                          {imageUploading ? 'Uploading...' : 'Upload Image'}
                        </span>
                      </Button>
                    </label>
                    {formData.img && (
                      <img src={formData.img} alt="Preview" className="w-16 h-16 object-cover rounded" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePuzzle} className="bg-purple-600 hover:bg-purple-700 text-white">
                  {editingPuzzle ? 'Update' : 'Add'} Puzzle
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminPage;