import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

const red = Color(0xFFFF1A1A), black = Color(0xFF0A0A0A);
final navKey = GlobalKey<NavigatorState>();
void main() => runApp(const SixSevenApp());

class SixSevenApp extends StatefulWidget {
  const SixSevenApp({super.key});
  @override State<SixSevenApp> createState() => _AppState();
}
class _AppState extends State<SixSevenApp> {
  late final Assistant assistant = Assistant()..start();
  @override void dispose() { assistant.dispose(); super.dispose(); }
  @override Widget build(BuildContext context) => MaterialApp(
    navigatorKey: navKey, title: 'SIX SEVEN APP', debugShowCheckedModeBanner: false,
    theme: ThemeData.dark().copyWith(scaffoldBackgroundColor: black, colorScheme: const ColorScheme.dark(primary: red, surface: Color(0xFF141414)), appBarTheme: const AppBarTheme(backgroundColor: black), inputDecorationTheme: InputDecorationTheme(filled: true, fillColor: const Color(0xFF161616), border: OutlineInputBorder(borderRadius: BorderRadius.circular(26), borderSide: BorderSide.none))),
    home: Home(assistant: assistant));
}

abstract class ActiveChat {
  String get messageDraft;
  void draft(String value);
  void send(String value);
}

class Assistant extends ChangeNotifier {
  final speech = stt.SpeechToText();
  final tts = FlutterTts();
  bool ready = false, active = false, listening = false, disposed = false, confirming = false;
  String userName = 'Mauro', status = 'En espera de “hey six seven”';
  Timer? restart;
  ActiveChat? currentChat;
  Future<void> start() async {
    ready = await speech.initialize(onStatus: (s) { listening = s == 'listening'; notifyListeners(); if (!disposed && !confirming && s != 'listening') _again(); }, onError: (_) { listening = false; notifyListeners(); _again(); });
    if (ready) await _listen(); else { status = 'Reconocimiento de voz no disponible'; notifyListeners(); }
  }
  void _again() { restart?.cancel(); if (!disposed && !confirming) restart = Timer(const Duration(milliseconds: 700), _listen); }
  Future<void> _listen() async {
    if (!ready || disposed || confirming || speech.isListening) return;
    try {
      await speech.listen(
        options: stt.SpeechListenOptions(
          listenFor: const Duration(seconds: 45),
          pauseFor: const Duration(seconds: 4),
          partialResults: true,
          cancelOnError: false,
          listenMode: stt.ListenMode.dictation,
        ),
        onResult: (r) {
          if (r.finalResult) {
            unawaited(command(r.recognizedWords.toLowerCase().trim()));
          }
        },
      );
    } catch (_) {
      _again();
    }
  }
  Future<void> command(String p) async {
    if (p.isEmpty) return;
    if (p.contains('desactivate') || p.contains('desactívate')) { active = false; status = 'Modo pasivo'; await speech.stop(); await tts.speak('Ok ' + userName + ', me desactivo'); notifyListeners(); _again(); return; }
    if (!active) {
      if (p.contains('hey six seven') || p.contains('hey sixseven')) { active = true; status = 'SIX SEVEN activo'; await speech.stop(); await tts.speak('Hola ' + userName + ', ¿qué necesitas que haga por ti?'); notifyListeners(); _again(); }
      return;
    }
    if (p.startsWith('buscar al contacto ')) {
      final n = p.substring('buscar al contacto '.length).trim();
      await tts.speak('Voy a buscar a ' + n);
      navKey.currentState?.push(MaterialPageRoute(builder: (_) => ContactSearch(query: n)));
    } else if (p.startsWith('entrar en el chat de ')) {
      final n = p.substring('entrar en el chat de '.length).trim();
      await tts.speak('Voy a abrir el chat de ' + n);
      navKey.currentState?.push(MaterialPageRoute(builder: (_) => Chat(name: n, assistant: this)));
    } else if (p.startsWith('escribirle ')) {
      final text = p.substring('escribirle '.length).trim();
      if (currentChat != null) {
        currentChat!.draft(text);
        status = 'Mensaje preparado; falta confirmar envío';
        await tts.speak('Preparé el mensaje. Decí enviar para confirmar.');
      } else { await tts.speak('Primero abrí un chat para preparar el mensaje'); }
    } else if (p == 'enviar') {
      final state = currentChat;
      if (state != null && state.messageDraft.trim().isNotEmpty) await confirm('send', state.messageDraft.trim(), '¿Querés enviar este mensaje?', 'Enviar');
      else await tts.speak('No hay mensaje preparado');
    } else if (p.startsWith('llamar a ')) {
      final n = p.substring('llamar a '.length).trim();
      await confirm('call', n, '¿Querés iniciar una llamada con ' + n + '?', 'Llamar');
    } else if (p.contains('cortar llamada')) { await tts.speak('No hay una llamada activa conectada'); }
    notifyListeners();
  }
  Future<void> confirm(String action, String value, String question, String button) async {
    confirming = true; await speech.stop();
    final context = navKey.currentContext;
    bool yes = false;
    if (context != null) yes = await showDialog<bool>(context: context, builder: (c) => AlertDialog(
      backgroundColor: const Color(0xFF171717), title: Text(question), content: action == 'send' ? Text(value) : null,
      actions: [TextButton(onPressed: () => Navigator.pop(c, false), child: const Text('Cancelar')), FilledButton(style: FilledButton.styleFrom(backgroundColor: red), onPressed: () => Navigator.pop(c, true), child: Text(button))])) ?? false;
    if (yes && action == 'send') { currentChat?.send(value); status = 'Mensaje agregado a la conversación local'; await tts.speak('Mensaje enviado'); }
    else if (yes && action == 'call') { status = 'Llamada pendiente de integración'; await tts.speak('El servicio de llamadas todavía debe conectarse'); }
    else { status = 'Acción cancelada'; await tts.speak('Acción cancelada'); }
    confirming = false; notifyListeners(); _again();
  }
  @override void dispose() { disposed = true; restart?.cancel(); speech.stop(); tts.stop(); super.dispose(); }
}

class Home extends StatefulWidget {
  const Home({super.key, required this.assistant}); final Assistant assistant;
  @override State<Home> createState() => _HomeState();
}
class _HomeState extends State<Home> {
  int tab = 0;
  @override Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Row(children: [Icon(Icons.all_inclusive, color: red, size: 30), SizedBox(width: 8), Text('SIX SEVEN', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 2))]), actions: [
      IconButton(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const Premium())), icon: const Icon(Icons.workspace_premium, color: red)),
      IconButton(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const Business())), icon: const Icon(Icons.storefront, color: red))]),
    body: Column(children: [
      Padding(padding: const EdgeInsets.all(14), child: TextField(decoration: const InputDecoration(prefixIcon: Icon(Icons.search, color: red), hintText: 'Buscar contactos y chats'))),
      Expanded(child: tab == 0 ? ListView(children: [
        Tile(name: 'Conversación de prueba', detail: 'Abrí para probar el chat', icon: Icons.person, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => Chat(name: 'Contacto', assistant: widget.assistant)))),
        Tile(name: 'Contactos', detail: 'Buscar personas', icon: Icons.people, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ContactSearch(query: '')))),
        Tile(name: 'Negocios locales', detail: 'Catálogos comerciales', icon: Icons.store, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const Business()))),
        AnimatedBuilder(animation: widget.assistant, builder: (_, __) => Padding(padding: const EdgeInsets.all(16), child: Text(widget.assistant.status, style: const TextStyle(color: Colors.white54))))]) : Center(child: Text(['Chats','Llamadas','Estados','Perfil'][tab], style: const TextStyle(fontSize: 24)))),
    ]),
    bottomNavigationBar: NavigationBar(backgroundColor: const Color(0xFF101010), indicatorColor: const Color(0x33FF1A1A), selectedIndex: tab, onDestinationSelected: (v) => setState(() => tab = v), destinations: const [
      NavigationDestination(icon: Icon(Icons.chat_bubble_outline), label: 'Chats'), NavigationDestination(icon: Icon(Icons.call_outlined), label: 'Llamadas'), NavigationDestination(icon: Icon(Icons.circle_outlined), label: 'Estados'), NavigationDestination(icon: Icon(Icons.person_outline), label: 'Perfil')]));
}

class Chat extends StatefulWidget {
  const Chat({super.key, required this.name, required this.assistant}); final String name; final Assistant assistant;
  @override State<Chat> createState() => _ChatState();
}
class _ChatState extends State<Chat> with SingleTickerProviderStateMixin implements ActiveChat {
  final text = TextEditingController(); final messages = <String>[];
  late final anim = AnimationController(vsync: this, duration: const Duration(seconds: 3))..repeat();
  @override void initState() { super.initState(); widget.assistant.currentChat = this; }
  @override String get messageDraft => text.text;
  @override void draft(String v) {
    text.text = v;
    text.selection = TextSelection.collapsed(offset: v.length);
    setState(() {});
  }
  @override void send(String v) {
    if (mounted) {
      setState(() { messages.add(v); text.clear(); });
    }
  }
  @override String get messageDraft => text.text;
  @override void draft(String v) { text.text = v;
  @override void send(String v) { if (mounted)
  @override void dispose() { if (identical(widget.assistant.currentChat, this)) widget.assistant.currentChat = null; anim.dispose(); text.dispose(); super.dispose(); }
  @override Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text(widget.name), actions: [IconButton(onPressed: () => widget.assistant.command('llamar a ' + widget.name), icon: const Icon(Icons.call, color: red))]),
    body: Stack(children: [
      Column(children: [
        Expanded(child: ListView(padding: const EdgeInsets.all(16), children: messages.map((m) => Align(alignment: Alignment.centerRight, child: Container(margin: const EdgeInsets.only(bottom: 8), padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: const Color(0xFF301010), borderRadius: BorderRadius.circular(16)), child: Text(m)))).toList())),
        Padding(padding: const EdgeInsets.fromLTRB(12, 8, 12, 12), child: Row(children: [
          const Icon(Icons.add_circle_outline, color: red), const SizedBox(width: 8),
          Expanded(child: TextField(controller: text, minLines: 1, maxLines: 4, decoration: const InputDecoration(hintText: 'Escribe un mensaje'))),
          IconButton(onPressed: () { if (text.text.trim().isNotEmpty) widget.assistant.confirm('send', text.text.trim(), '¿Querés enviar este mensaje?', 'Enviar'); }, icon: const Icon(Icons.send, color: red))])),
      ]),
      Positioned(left: 0, right: 0, bottom: 108, child: Center(child: AnimatedBuilder(animation: Listenable.merge([anim, widget.assistant]), builder: (_, __) => AIAssistantOrb(phase: anim.value, listening: widget.assistant.active || widget.assistant.listening, onTap: () => widget.assistant.command(widget.assistant.active ? 'desactivate' : 'hey six seven'))))),
    ]));
}

class AIAssistantOrb extends StatelessWidget {
  const AIAssistantOrb({super.key, required this.phase, required this.listening, required this.onTap});
  final double phase; final bool listening; final VoidCallback onTap;
  @override Widget build(BuildContext context) {
    final d = listening ? 52.0 : 42.0;
    return GestureDetector(onTap: onTap, child: AnimatedContainer(duration: const Duration(milliseconds: 350), width: d, height: d,
      decoration: BoxDecoration(color: black.withValues(alpha: .82), shape: BoxShape.circle, border: Border.all(color: red.withValues(alpha: .9), width: 1.3), boxShadow: [BoxShadow(color: red.withValues(alpha: .9), blurRadius: listening ? 25 : 18, spreadRadius: listening ? 2 : 1)]),
      child: ClipOval(child: CustomPaint(painter: SmokePainter(phase, listening)))));
  }
}
class SmokePainter extends CustomPainter {
  SmokePainter(this.phase, this.listening); final double phase; final bool listening;
  @override void paint(Canvas canvas, Size size) {
    final c = Offset(size.width / 2, size.height / 2), r = size.width / 2;
    canvas.drawCircle(c, r, Paint()..color = black.withValues(alpha: .96));
    for (var s = 0; s < 5; s++) {
      final path = Path(); final turns = listening ? 4.2 : 2.6;
      for (var i = 0; i <= 120; i++) {
        final t = i / 120, a = t * math.pi * 2 * turns + phase * math.pi * 2 * (listening ? 1.7 : .65) + s * math.pi * 2 / 5;
        final radius = r * (.04 + .82 * t) + math.sin(t * 18 + phase * 6 + s) * r * .04;
        final p = Offset(c.dx + math.cos(a) * radius, c.dy + math.sin(a) * radius);
        if (i == 0) { path.moveTo(p.dx, p.dy); } else { path.lineTo(p.dx, p.dy); }
      }
      canvas.drawPath(path, Paint()..style = PaintingStyle.stroke..strokeWidth = (listening ? 2.0 : 1.5)..strokeCap = StrokeCap.round..color = (s.isEven ? const Color(0xFF303030) : const Color(0xFF181818)).withValues(alpha: .9));
    }
    final pulse = .85 + .15 * math.sin(phase * math.pi * 2);
    canvas.drawCircle(c, r * .14 * pulse, Paint()..color = red.withValues(alpha: .96)..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4));
    canvas.drawCircle(c, r * .05, Paint()..color = const Color(0xFFFF8585));
  }
  @override bool shouldRepaint(covariant SmokePainter old) => old.phase != phase || old.listening != listening;
}

class Tile extends StatelessWidget {
  const Tile({super.key, required this.name, required this.detail, required this.icon, required this.onTap});
  final String name, detail; final IconData icon; final VoidCallback onTap;
  @override Widget build(BuildContext context) => ListTile(onTap: onTap, leading: CircleAvatar(backgroundColor: const Color(0xFF242424), child: Icon(icon, color: red)), title: Text(name), subtitle: Text(detail, style: const TextStyle(color: Colors.white54)), trailing: const Icon(Icons.chevron_right, color: red));
}
class ContactSearch extends StatelessWidget {
  const ContactSearch({super.key, required this.query}); final String query;
  @override Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Buscar contacto')), body: Padding(padding: const EdgeInsets.all(16), child: TextField(controller: TextEditingController(text: query), decoration: const InputDecoration(prefixIcon: Icon(Icons.search, color: red), hintText: 'Nombre del contacto'))));
}
class Premium extends StatelessWidget {
  const Premium({super.key});
  @override Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('SIX SEVEN PREMIUM')), body: ListView(padding: const EdgeInsets.all(20), children: [
    const Icon(Icons.all_inclusive, color: red, size: 68), const Text('Llevá tu experiencia al siguiente nivel', textAlign: TextAlign.center, style: TextStyle(fontSize: 23, fontWeight: FontWeight.w900)),
    const SizedBox(height: 8), const Text('7 días gratis · Después ARS 2.000/mes', textAlign: TextAlign.center, style: TextStyle(color: red, fontSize: 17, fontWeight: FontWeight.bold)), const SizedBox(height: 20),
    for (final f in ['SIX SEVEN ilimitado','Resumí chats largos','Dictá mensajes por voz','Agendá llamadas','Respuestas automáticas']) Card(child: ListTile(leading: const Icon(Icons.check_circle, color: red), title: Text(f))),
    FilledButton(style: FilledButton.styleFrom(backgroundColor: red), onPressed: () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Compras pendientes de configurar en RevenueCat.'))), child: const Text('PROBAR 7 DÍAS GRATIS')),
    TextButton(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const Business())), child: const Text('Conocé Business'))]));
}
class Business extends StatelessWidget {
  const Business({super.key});
  @override Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('SIX SEVEN BUSINESS')), body: ListView(padding: const EdgeInsets.all(20), children: [
    const Icon(Icons.storefront, color: red, size: 64), const Text('Tu negocio, conectado', textAlign: TextAlign.center, style: TextStyle(fontSize: 25, fontWeight: FontWeight.w900)),
    const SizedBox(height: 8), const Text('ARS 5.000/mes', textAlign: TextAlign.center, style: TextStyle(color: red, fontSize: 22, fontWeight: FontWeight.bold)), const SizedBox(height: 20),
    for (final f in ['Perfil comercial para Candelaria y Posadas','Catálogo de productos y servicios','Respuestas automáticas','Solicitud de verificación']) Card(child: ListTile(leading: const Icon(Icons.check_circle_outline, color: red), title: Text(f))),
    FilledButton(style: FilledButton.styleFrom(backgroundColor: red), onPressed: () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Alta y cobro Business pendientes de configurar.'))), child: const Text('SOLICITAR CUENTA BUSINESS'))]));
}
