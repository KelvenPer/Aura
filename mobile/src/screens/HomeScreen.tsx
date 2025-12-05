import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bot, CheckCircle2, FileText, LogOut, MoreHorizontal, Stethoscope } from "lucide-react-native";

import { Agendamento, AuraAPI } from "../services/api";

type HomeScreenProps = {
  token: string;
  userName?: string;
  onLogout?: () => void;
};

export default function HomeScreen({ token, userName, onLogout }: HomeScreenProps) {
  const [agenda, setAgenda] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiStatus, setApiStatus] = useState<"online" | "offline">("online");

  const doctorName = useMemo(() => userName ?? "Dr. Kelven", [userName]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const health = await AuraAPI.healthCheck();
      if (health.status === "offline") {
        setApiStatus("offline");
        setLoading(false);
        setRefreshing(false);
        return;
      }
      setApiStatus("online");

      const dadosAgenda = await AuraAPI.getAgenda();
      setAgenda(dadosAgenda);
    } catch (error: any) {
      console.error("Erro ao carregar home:", error);
      if (error?.response?.status === 401 && onLogout) {
        onLogout();
        return;
      }
      setApiStatus("offline");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, onLogout]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const proximoPaciente = agenda.find(
    (a) => a.status === "agendado" || a.status === "confirmado"
  );

  const dataHoje = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long" });

  if (loading) {
    return (
      <View className="flex-1 bg-void-950 items-center justify-center">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="text-gray-400 mt-4 font-medium">Sincronizando com Aura...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-void-950">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
        }
      >
        <View className="px-6 pt-4 pb-6 flex-row justify-between items-center">
          <View>
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
              {dataHoje}
            </Text>
            <Text className="text-2xl font-bold text-white">Ola, {doctorName}</Text>
            {apiStatus === "offline" && (
              <View className="bg-rose-500/10 px-2 py-1 rounded mt-2 self-start border border-rose-500/20">
                <Text className="text-rose-400 text-[10px] font-bold">
                  OFFLINE - Verifique o Docker
                </Text>
              </View>
            )}
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity className="p-3 bg-void-900 rounded-full border border-void-800 active:bg-void-800">
              <Bot size={24} color="#6366F1" />
            </TouchableOpacity>
            {onLogout && (
              <TouchableOpacity
                onPress={onLogout}
                className="p-3 bg-void-900 rounded-full border border-void-800 active:bg-void-800"
              >
                <LogOut size={22} color="#F87171" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View className="px-4 mb-6 flex-row gap-3">
          <View className="flex-1 bg-void-900 p-4 rounded-2xl border border-void-800 items-center">
            <Text className="text-3xl font-bold text-white">{agenda.length}</Text>
            <Text className="text-[10px] text-gray-500 uppercase font-bold mt-1">Pacientes</Text>
          </View>
          <View className="flex-1 bg-void-900 p-4 rounded-2xl border border-void-800 items-center">
            <Text className="text-3xl font-bold text-emerald-400">
              {agenda.filter((a) => a.status === "finalizado").length}
            </Text>
            <Text className="text-[10px] text-gray-500 uppercase font-bold mt-1">Atendidos</Text>
          </View>
        </View>

        {proximoPaciente ? (
          <View className="px-4 mb-8">
            <View className="flex-row justify-between items-center mb-3 px-1">
              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                <Text className="text-xs font-bold text-primary-500 uppercase tracking-widest">
                  A SEGUIR
                </Text>
              </View>
              <Text className="text-gray-400 text-xs font-medium">
                {new Date(proximoPaciente.data_hora_inicio).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>

            <View className="bg-primary-500/10 rounded-[1.5rem] p-5 border border-primary-500/30 relative overflow-hidden">
              <View className="flex-row justify-between items-start mb-6">
                <View className="flex-row gap-4">
                  <View className="w-14 h-14 bg-primary-500 rounded-2xl items-center justify-center shadow-lg shadow-primary-500/50">
                    <Text className="text-white font-bold text-xl">
                      {proximoPaciente.paciente.nome.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-white text-lg font-bold">
                      {proximoPaciente.paciente.nome}
                    </Text>
                    <View className="flex-row items-center gap-1.5 mt-1">
                      <Stethoscope size={14} color="#A5B4FC" />
                      <Text className="text-indigo-200 text-sm font-medium">
                        {proximoPaciente.tipo}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity>
                  <MoreHorizontal size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity className="flex-1 bg-primary-500 py-3 rounded-xl flex-row items-center justify-center gap-2 shadow-lg shadow-primary-500/20 active:opacity-90">
                  <CheckCircle2 size={18} color="white" />
                  <Text className="text-white font-bold text-sm">Iniciar</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-void-900 border border-void-800 py-3 rounded-xl flex-row items-center justify-center gap-2 active:bg-void-800">
                  <FileText size={18} color="#94A3B8" />
                  <Text className="text-gray-400 font-bold text-sm">Prontuario</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View className="px-4 mb-8">
            <View className="bg-void-900 p-6 rounded-2xl border border-void-800 items-center">
              <CheckCircle2 size={40} color="#34D399" className="mb-2 opacity-50" />
              <Text className="text-gray-400 font-medium">Nenhum paciente agendado a seguir.</Text>
            </View>
          </View>
        )}

        <View className="px-4 pb-10">
          <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 ml-1">
            CRONOGRAMA DO DIA
          </Text>

          <View className="pl-4 border-l-2 border-void-800 ml-3 space-y-6">
            {agenda.map((item) => {
              const hora = new Date(item.data_hora_inicio).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const isFinalizado = item.status === "finalizado";

              return (
                <View key={item.id} className="relative pl-6">
                  <View
                    className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-void-950 ${
                      isFinalizado ? "bg-emerald-500" : "bg-void-700"
                    }`}
                  />

                  <View
                    className={`p-4 rounded-xl border ${
                      isFinalizado ? "bg-void-900/50 border-void-800" : "bg-void-900 border-void-700"
                    }`}
                  >
                    <View className="flex-row justify-between items-start">
                      <View>
                        <Text
                          className={`font-bold text-base ${
                            isFinalizado ? "text-gray-500 line-through" : "text-gray-200"
                          }`}
                        >
                          {item.paciente.nome}
                        </Text>
                        <Text className="text-gray-500 text-xs mt-0.5">{item.tipo}</Text>
                      </View>
                      <View className="items-end">
                        <Text
                          className={`font-bold ${
                            isFinalizado ? "text-gray-600" : "text-primary-500"
                          }`}
                        >
                          {hora}
                        </Text>
                        {isFinalizado && <CheckCircle2 size={14} color="#10B981" className="mt-1" />}
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}

            {agenda.length === 0 && (
              <Text className="text-gray-600 text-sm ml-6 italic">Agenda vazia para hoje.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
