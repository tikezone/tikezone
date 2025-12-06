'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  Megaphone, Video, RefreshCw, Plus, Trash2, Edit2, 
  CheckCircle, XCircle, Save, X, Upload, Link as LinkIcon
} from 'lucide-react';

interface Announcement {
  id: number;
  text: string;
  color: string;
  active: boolean;
  priority: number;
}

interface EventVideo {
  id: number;
  event_id: string;
  video_url: string;
  thumbnail_url: string | null;
  title: string | null;
  banner_text: string | null;
  active: boolean;
  priority: number;
  event_title?: string;
}

interface EventOption {
  id: string;
  title: string;
}

export default function AdminContentPage() {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [videos, setVideos] = useState<EventVideo[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [activeTab, setActiveTab] = useState<'announcements' | 'videos'>('announcements');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({ text: '', color: 'white', priority: 0 });

  const [showVideoForm, setShowVideoForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<EventVideo | null>(null);
  const [videoForm, setVideoForm] = useState({ 
    video_type: 'url' as 'url' | 'upload',
    title: '', 
    description: '',
    video_url: '', 
    banner_text: '',
    priority: 0 
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [annRes, vidRes] = await Promise.all([
        fetch('/api/admin/announcements'),
        fetch('/api/admin/event-videos')
      ]);
      
      if (annRes.ok) {
        const data = await annRes.json();
        setAnnouncements(data.announcements || []);
      }
      if (vidRes.ok) {
        const data = await vidRes.json();
        setVideos(data.videos || []);
        setEvents((data.events || []).map((e: { id: string; title: string }) => ({ id: e.id, title: e.title })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSaveAnnouncement = async () => {
    if (!announcementForm.text.trim()) {
      showMessage('error', 'Veuillez entrer le texte de l\'annonce');
      return;
    }

    try {
      const url = '/api/admin/announcements';
      const method = editingAnnouncement ? 'PUT' : 'POST';
      const payload = editingAnnouncement 
        ? { id: editingAnnouncement.id, ...announcementForm }
        : announcementForm;
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showMessage('success', editingAnnouncement ? 'Annonce modifiee' : 'Annonce creee');
        setShowAnnouncementForm(false);
        setEditingAnnouncement(null);
        setAnnouncementForm({ text: '', color: 'white', priority: 0 });
        fetchData();
      } else {
        const data = await res.json();
        showMessage('error', data.error || 'Erreur');
      }
    } catch (error) {
      showMessage('error', 'Erreur de connexion');
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (!confirm('Supprimer cette annonce ?')) return;
    
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showMessage('success', 'Annonce supprimee');
        fetchData();
      } else {
        const data = await res.json();
        showMessage('error', data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      showMessage('error', 'Erreur lors de la suppression');
    }
  };

  const handleToggleAnnouncement = async (ann: Announcement) => {
    try {
      await fetch('/api/admin/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ann.id, text: ann.text, color: ann.color, priority: ann.priority, active: !ann.active })
      });
      fetchData();
    } catch (error) {
      showMessage('error', 'Erreur');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      showMessage('error', 'Veuillez selectionner un fichier video');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      showMessage('error', 'La video ne doit pas depasser 100 Mo');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'video');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setVideoForm(prev => ({ ...prev, video_url: data.url }));
        showMessage('success', 'Video telechargee');
      } else {
        const data = await res.json();
        showMessage('error', data.error || 'Erreur lors du telechargement');
      }
    } catch (error) {
      showMessage('error', 'Erreur lors du telechargement');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveVideo = async () => {
    if (!videoForm.video_url.trim()) {
      showMessage('error', 'Veuillez ajouter une video (URL ou fichier)');
      return;
    }

    try {
      const url = '/api/admin/event-videos';
      const method = editingVideo ? 'PUT' : 'POST';
      const payload = {
        ...(editingVideo ? { id: editingVideo.id } : {}),
        video_url: videoForm.video_url,
        title: videoForm.title.trim() || null,
        banner_text: videoForm.banner_text.trim() || null,
        priority: videoForm.priority
      };
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showMessage('success', editingVideo ? 'Video modifiee' : 'Video ajoutee');
        setShowVideoForm(false);
        setEditingVideo(null);
        setVideoForm({ video_type: 'url', title: '', description: '', video_url: '', banner_text: '', priority: 0 });
        fetchData();
      } else {
        const data = await res.json();
        showMessage('error', data.error || 'Erreur');
      }
    } catch (error) {
      showMessage('error', 'Erreur de connexion');
    }
  };

  const handleDeleteVideo = async (id: number) => {
    if (!confirm('Supprimer cette video ?')) return;
    
    try {
      const res = await fetch(`/api/admin/event-videos?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showMessage('success', 'Video supprimee');
        fetchData();
      } else {
        const data = await res.json();
        showMessage('error', data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      showMessage('error', 'Erreur lors de la suppression');
    }
  };

  const handleToggleVideo = async (vid: EventVideo) => {
    try {
      await fetch('/api/admin/event-videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: vid.id, 
          video_url: vid.video_url, 
          title: vid.title, 
          banner_text: vid.banner_text,
          priority: vid.priority, 
          active: !vid.active 
        })
      });
      fetchData();
    } catch (error) {
      showMessage('error', 'Erreur');
    }
  };

  const startEditAnnouncement = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setAnnouncementForm({ text: ann.text, color: ann.color, priority: ann.priority });
    setShowAnnouncementForm(true);
  };

  const startEditVideo = (vid: EventVideo) => {
    setEditingVideo(vid);
    setVideoForm({ 
      video_type: 'url',
      title: vid.title || '',
      description: '',
      video_url: vid.video_url, 
      banner_text: vid.banner_text || '',
      priority: vid.priority 
    });
    setShowVideoForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
            <Megaphone size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Gestion du Contenu</h1>
            <p className="text-gray-400">Annonces dynamiques et videos evenements</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-colors"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-2 border-b border-gray-700 pb-4">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'announcements'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <Megaphone size={18} />
          Annonces ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'videos'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <Video size={18} />
          Videos ({videos.length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {activeTab === 'announcements' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setEditingAnnouncement(null);
                    setAnnouncementForm({ text: '', color: 'white', priority: 0 });
                    setShowAnnouncementForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white transition-colors"
                >
                  <Plus size={18} />
                  Nouvelle annonce
                </button>
              </div>

              {showAnnouncementForm && (
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4">
                    {editingAnnouncement ? 'Modifier l\'annonce' : 'Nouvelle annonce'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Texte de l'annonce</label>
                      <input
                        type="text"
                        value={announcementForm.text}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, text: e.target.value })}
                        placeholder="Ex: Nouveaux evenements disponibles!"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Couleur</label>
                        <select
                          value={announcementForm.color}
                          onChange={(e) => setAnnouncementForm({ ...announcementForm, color: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="white">Blanc</option>
                          <option value="orange">Orange</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Priorite (ordre)</label>
                        <input
                          type="number"
                          value={announcementForm.priority}
                          onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => {
                          setShowAnnouncementForm(false);
                          setEditingAnnouncement(null);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-white transition-colors"
                      >
                        <X size={18} /> Annuler
                      </button>
                      <button
                        onClick={handleSaveAnnouncement}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white transition-colors"
                      >
                        <Save size={18} /> Enregistrer
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-700/50">
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Texte</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Couleur</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Priorite</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Statut</th>
                      <th className="text-right py-4 px-4 text-gray-400 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-gray-400">
                          <Megaphone size={48} className="mx-auto mb-3 text-gray-600" />
                          <p>Aucune annonce</p>
                        </td>
                      </tr>
                    ) : (
                      announcements.map((ann) => (
                        <tr key={ann.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                          <td className="py-4 px-4">
                            <p className="text-white">{ann.text}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              ann.color === 'orange' ? 'bg-orange-500/20 text-orange-400' : 'bg-white/20 text-white'
                            }`}>
                              {ann.color === 'orange' ? 'Orange' : 'Blanc'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-400">{ann.priority}</td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleToggleAnnouncement(ann)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                ann.active 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}
                            >
                              {ann.active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                              {ann.active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => startEditAnnouncement(ann)}
                                className="p-2 hover:bg-gray-600 rounded-lg text-gray-400 hover:text-white transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteAnnouncement(ann.id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setEditingVideo(null);
                    setVideoForm({ video_type: 'url', title: '', description: '', video_url: '', banner_text: '', priority: 0 });
                    setShowVideoForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white transition-colors"
                >
                  <Plus size={18} />
                  Nouvelle video
                </button>
              </div>

              {showVideoForm && (
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4">
                    {editingVideo ? 'Modifier la video' : 'Ajouter une video'}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-4 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="video_type"
                          checked={videoForm.video_type === 'url'}
                          onChange={() => setVideoForm({ ...videoForm, video_type: 'url' })}
                          className="w-4 h-4 text-purple-500"
                        />
                        <LinkIcon size={16} className="text-gray-400" />
                        <span className="text-white text-sm">URL (YouTube/Vimeo)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="video_type"
                          checked={videoForm.video_type === 'upload'}
                          onChange={() => setVideoForm({ ...videoForm, video_type: 'upload' })}
                          className="w-4 h-4 text-purple-500"
                        />
                        <Upload size={16} className="text-gray-400" />
                        <span className="text-white text-sm">Telecharger</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Titre</label>
                      <input
                        type="text"
                        value={videoForm.title}
                        onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                        placeholder="Titre de la video"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Description (optionnel)</label>
                      <input
                        type="text"
                        value={videoForm.description}
                        onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                        placeholder="Description de la video"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {videoForm.video_type === 'url' ? (
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">URL (YouTube ou Vimeo)</label>
                        <input
                          type="url"
                          value={videoForm.video_url}
                          onChange={(e) => setVideoForm({ ...videoForm, video_url: e.target.value })}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Fichier video</label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="video/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 border-dashed rounded-xl text-gray-400 hover:text-white hover:border-purple-500 transition-colors flex items-center justify-center gap-2"
                          >
                            {uploading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500"></div>
                                Telechargement...
                              </>
                            ) : (
                              <>
                                <Upload size={18} />
                                Cliquez pour telecharger
                              </>
                            )}
                          </button>
                        </div>
                        {videoForm.video_url && (
                          <p className="mt-2 text-green-400 text-sm flex items-center gap-2">
                            <CheckCircle size={14} />
                            Video telechargee
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Texte du bandeau (optionnel)</label>
                      <input
                        type="text"
                        value={videoForm.banner_text}
                        onChange={(e) => setVideoForm({ ...videoForm, banner_text: e.target.value })}
                        placeholder="Texte qui defile en dessous de la video"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                      <p className="text-gray-500 text-xs mt-1">Ce texte defilera en continu sous la video</p>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Ordre</label>
                      <input
                        type="number"
                        value={videoForm.priority}
                        onChange={(e) => setVideoForm({ ...videoForm, priority: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => {
                          setShowVideoForm(false);
                          setEditingVideo(null);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-white transition-colors"
                      >
                        <X size={18} /> Annuler
                      </button>
                      <button
                        onClick={handleSaveVideo}
                        disabled={uploading}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white transition-colors disabled:opacity-50"
                      >
                        <Save size={18} /> Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-white font-medium">Liste des Videos</h3>
                {videos.length === 0 ? (
                  <div className="bg-gray-800 rounded-2xl border border-gray-700 p-12 text-center">
                    <Video size={48} className="mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-400">Aucune video</p>
                  </div>
                ) : (
                  videos.map((vid) => (
                    <div key={vid.id} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-bold">{vid.title || 'Sans titre'}</h4>
                            <span className="text-gray-500 text-sm">(Ordre: {vid.priority})</span>
                          </div>
                          <p className="text-gray-400 text-sm truncate max-w-lg">{vid.video_url}</p>
                          {vid.banner_text && (
                            <p className="text-purple-400 text-xs mt-1">Bandeau: {vid.banner_text}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleVideo(vid)}
                            className={`p-2 rounded-lg ${
                              vid.active 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {vid.active ? <CheckCircle size={16} /> : <XCircle size={16} />}
                          </button>
                          <button
                            onClick={() => startEditVideo(vid)}
                            className="p-2 hover:bg-gray-600 rounded-lg text-gray-400 hover:text-white transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(vid.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
