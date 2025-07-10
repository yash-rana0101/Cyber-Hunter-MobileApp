import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import GlassCard from '../../components/ui/GlassCard';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { Colors } from '../../constants/Colors';

interface Message {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  message: string;
  timestamp: Date;
  isOwn: boolean;
}

const TeamChatScreen: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      userId: '1',
      username: 'Alex Chen',
      avatar: '👨‍💻',
      message: 'Hey team! Just pushed the latest updates to the smart contract. Ready for review!',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isOwn: false,
    },
    {
      id: '2',
      userId: '2',
      username: 'Sarah Kim',
      avatar: '👩‍🎨',
      message: 'Great work! I\'ll start the UI integration once the contract is deployed.',
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      isOwn: false,
    },
    {
      id: '3',
      userId: 'current',
      username: 'You',
      avatar: '🔰',
      message: 'Perfect timing! I just finished the API endpoints.',
      timestamp: new Date(Date.now() - 1 * 60 * 1000),
      isOwn: true,
    },
    {
      id: '4',
      userId: '3',
      username: 'Mike Johnson',
      avatar: '🛡️',
      message: 'I\'ve completed the security audit. Found a few minor issues, will submit the report shortly.',
      timestamp: new Date(Date.now() - 30 * 1000),
      isOwn: false,
    },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        userId: 'current',
        username: 'You',
        avatar: '🔰',
        message: message.trim(),
        timestamp: new Date(),
        isOwn: true,
      };
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return timestamp.toLocaleDateString();
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isOwn && styles.ownMessageContainer]}>
      {!item.isOwn && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.avatar}</Text>
        </View>
      )}
      <View style={[styles.messageBubble, item.isOwn && styles.ownMessageBubble]}>
        {!item.isOwn && (
          <Text style={styles.username}>{item.username}</Text>
        )}
        <Text style={[styles.messageText, item.isOwn && styles.ownMessageText]}>
          {item.message}
        </Text>
        <Text style={[styles.timestamp, item.isOwn && styles.ownTimestamp]}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
      {item.isOwn && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.avatar}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        style={styles.container}
      >
        <ScreenHeader 
          title="Team Chat" 
          showBackButton 
          rightComponent={
            <TouchableOpacity style={styles.infoButton}>
              <Ionicons name="information-circle-outline" size={24} color={Colors.text} />
            </TouchableOpacity>
          }
        />
        
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Team Info Banner */}
          <GlassCard style={styles.teamBanner}>
            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>Quantum Defenders</Text>
              <View style={styles.membersOnline}>
                <View style={styles.onlineIndicator} />
                <Text style={styles.membersText}>8 members • 5 online</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </GlassCard>

          {/* Messages List */}
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          />

          {/* Message Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TouchableOpacity style={styles.attachButton}>
                <Ionicons name="add-circle-outline" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
              <TextInput
                style={styles.textInput}
                placeholder="Type a message..."
                placeholderTextColor={Colors.textSecondary}
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={500}
              />
              <TouchableOpacity 
                style={[styles.sendButton, message.trim() && styles.sendButtonActive]}
                onPress={handleSendMessage}
                disabled={!message.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={message.trim() ? Colors.primary : Colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  infoButton: {
    padding: 4,
  },
  teamBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  membersOnline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  membersText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  settingsButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContent: {
    paddingVertical: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  avatarText: {
    fontSize: 16,
  },
  messageBubble: {
    maxWidth: '70%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  ownMessageBubble: {
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
    borderColor: 'rgba(34, 211, 238, 0.3)',
  },
  username: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  ownMessageText: {
    color: Colors.text,
  },
  timestamp: {
    fontSize: 10,
    color: Colors.textSecondary,
    alignSelf: 'flex-end',
  },
  ownTimestamp: {
    color: Colors.textSecondary,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  attachButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  sendButtonActive: {
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
  },
});

export default TeamChatScreen;
