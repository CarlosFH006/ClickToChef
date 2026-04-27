import { View, Text, FlatList, Pressable, ActivityIndicator, ScrollView, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMenuStore } from '../../../../store/useMenuStore'
import CategoriaFList from '../../../../presentation/pedido/components/productos/CategoriaFList'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import { useOrderStore } from '../../../../store/useOrderStore'
import { updateMesaStatusAction } from '../../../../core/actions/update-mesa-status-action'
import { liberarReservaAction } from '../../../../core/actions/liberar-reserva-action'
import { Colors } from '../../../../constants/theme'
import MenuFList from '../../../../presentation/pedido/components/productos/MenuFList'

const ProductosIndex = () => {
  const { categorias, isLoading } = useMenuStore();
  const { items, getTotal } = useOrderStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const { mesaId, pedidoId } = useLocalSearchParams();
  const navigation = useNavigation();

  const todosLosProductos = categorias.flatMap(c => c.productos);
  const resultadosBusqueda = todosLosProductos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  //Al salir de la pantalla de productos, se libera la mesa y se limpia el pedido
  useEffect(() => {
    //Listener para detectar cuando se sale de la pantalla de productos
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      //Obtener el tipo de acción
      const actionType = e.data.action.type;
      console.log('Navegación detectada al salir:', actionType);

      //Si se sale de la pantalla de productos, se libera la mesa y se limpia el pedido
      if (actionType === 'POP' && mesaId) {
        const currentItems = useOrderStore.getState().items;
        currentItems.forEach(item => {
          liberarReservaAction(item.id, item.cantidad);
        });
        if (!pedidoId) {
          updateMesaStatusAction(Number(mesaId), 'LIBRE');
        }
        useOrderStore.getState().clearOrder();
      }
    });
    //Limpiar el listener al salir de la pantalla
    return unsubscribe;
  }, [navigation, mesaId]);

  useEffect(() => {
    if (categorias.length > 0 && selectedCategoryId === null) {
      setSelectedCategoryId(categorias[0].id);
    }
  }, [categorias]);

  const filteredCategorias = selectedCategoryId === null
    ? categorias
    : categorias.filter(cat => cat.id === selectedCategoryId);

  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);

  if(isLoading){
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-superficie" edges={[]}>

      {/* Cabecera estática */}
      <View className="px-5 pt-3 pb-1">
        <View className="flex-row items-center">
          <Text className="font-titulo text-2xl text-principal">Mesa {mesaId}</Text>
          <View className="bg-primary/[8%] px-2.5 py-0.5 rounded-full ml-2">
            <Text className="font-cuerpo text-xs text-primary">Catálogo</Text>
          </View>
        </View>
        <Text className="font-cuerpo text-sm text-secundario mt-0.5">
          Añade los productos del pedido
        </Text>
      </View>

      {/* Buscador estático */}
      <View className="px-5 py-2">
        <TextInput
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar producto..."
          placeholderTextColor="#71717a"
          className="bg-fondo border border-borde rounded-xl px-4 py-3 font-cuerpo text-sm text-principal"
        />
      </View>

      {/* Categorías estáticas — ocultas al buscar */}
      {busqueda === '' && (
        <View className="py-2 mb-2">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categorias}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setSelectedCategoryId(item.id)}
                className={`mr-3 px-4 py-2 rounded-full border ${selectedCategoryId === item.id
                  ? 'bg-primary border-primary'
                  : 'bg-transparent border-borde'
                  }`}
              >
                <Text className={`font-titulo text-sm ${selectedCategoryId === item.id ? 'text-superficie' : 'text-secundario'
                  }`}>
                  {item.nombre}
                </Text>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* Lista scrollable */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {busqueda === '' ? (
          <CategoriaFList categorias={filteredCategorias} />
        ) : (
          <MenuFList productos={resultadosBusqueda} busqueda={busqueda} />
        )}
      </ScrollView>

      {/* Botón Resumen Pedido — fijo en la parte inferior */}
      {items.length > 0 && (
        <View className="px-5 py-4 bg-superficie border-t border-borde shadow-lg">
          <Pressable
            onPress={() => router.push({ pathname: '/(clicktochef-app)/(stack)/pedido', params: { pedidoId } })}
            className="flex-row items-center justify-between p-4 rounded-2xl bg-primary active:opacity-90"
          >
            <View className="flex-row items-center">
              <View className="bg-white/20 w-8 h-8 rounded-lg items-center justify-center mr-3">
                <Text className="text-superficie font-titulo">{totalItems}</Text>
              </View>
              <Text className="text-superficie font-titulo text-lg">Resumen Pedido</Text>
            </View>
            <Text className="text-superficie font-titulo text-lg">{getTotal().toFixed(2)}€</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  )
}

export default ProductosIndex
