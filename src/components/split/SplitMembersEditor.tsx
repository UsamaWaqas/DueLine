import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Plus, Trash2 } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { NeuSurface } from '../neu/NeuSurface';
import { NeuInput } from '../neu/NeuInput';
import { NeuIconButton } from '../neu/NeuIconButton';
import { NeuSegmented } from '../neu/NeuSegmented';
import { formatMoney } from '../../utils/currency';
import type { SplitMember } from '../../data/types';

type Props = {
  price: number;
  currency: string;
  members: SplitMember[];
  onChange: (members: SplitMember[]) => void;
};

function splitEqually(price: number, count: number): number {
  if (count === 0) return 0;
  return Math.round((price / count) * 100) / 100;
}

export function SplitMembersEditor({ price, currency, members, onChange }: Props) {
  const { theme } = useAppTheme();
  const [mode, setMode] = useState(0); // 0 = equal, 1 = custom
  const [newName, setNewName] = useState('');

  const addMember = () => {
    const name = newName.trim();
    if (!name) return;
    const next = [...members, { id: `${Date.now()}`, name, share: 0, paid: false }];
    onChange(mode === 0 ? applyEqualSplit(next, price) : next);
    setNewName('');
  };

  const removeMember = (id: string) => {
    const next = members.filter(m => m.id !== id);
    onChange(mode === 0 ? applyEqualSplit(next, price) : next);
  };

  const setShare = (id: string, value: string) => {
    const parsed = parseFloat(value);
    onChange(members.map(m => (m.id === id ? { ...m, share: Number.isFinite(parsed) ? parsed : 0 } : m)));
  };

  const changeMode = (i: number) => {
    setMode(i);
    if (i === 0) onChange(applyEqualSplit(members, price));
  };

  function applyEqualSplit(list: SplitMember[], total: number): SplitMember[] {
    const share = splitEqually(total, list.length);
    return list.map(m => ({ ...m, share }));
  }

  const allocated = members.reduce((sum, m) => sum + m.share, 0);
  const yourShare = Math.max(0, Math.round((price - allocated) * 100) / 100);

  return (
    <View style={{ gap: 12 }}>
      <NeuSegmented options={['Split equally', 'Custom amounts']} value={mode} onChange={changeMode} />

      <View style={{ gap: 10 }}>
        {members.map(m => (
          <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ flex: 1, fontSize: 14, color: theme.ink, fontWeight: '500' }} numberOfLines={1}>
              {m.name}
            </Text>
            {mode === 1 ? (
              <NeuInput
                value={m.share ? String(m.share) : ''}
                onChangeText={v => setShare(m.id, v)}
                keyboardType="decimal-pad"
                placeholder="0.00"
                containerStyle={{ width: 100 }}
              />
            ) : (
              <Text style={{ fontSize: 14, fontWeight: '600', color: theme.ink }}>
                {formatMoney(m.share, currency)}
              </Text>
            )}
            <NeuIconButton size={34} accessibilityLabel={`Remove ${m.name}`} onPress={() => removeMember(m.id)}>
              <Trash2 size={15} color={theme.bad} />
            </NeuIconButton>
          </View>
        ))}
        {members.length === 0 && (
          <Text style={{ fontSize: 12.5, color: theme.ink3 }}>Add people to split this subscription with.</Text>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <NeuInput
          value={newName}
          onChangeText={setNewName}
          placeholder="Person's name"
          containerStyle={{ flex: 1 }}
          onSubmitEditing={addMember}
        />
        <NeuIconButton size={52} accessibilityLabel="Add person" onPress={addMember}>
          <Plus size={18} color={theme.ink} />
        </NeuIconButton>
      </View>

      <NeuSurface variant="flat" radius={12}>
        <View style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 12.5, color: theme.ink2 }}>Your share</Text>
          <Text style={{ fontSize: 12.5, fontWeight: '700', color: theme.ink }}>
            {formatMoney(yourShare, currency)}
          </Text>
        </View>
      </NeuSurface>
    </View>
  );
}
