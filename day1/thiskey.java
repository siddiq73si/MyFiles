class ThisKey{	
		int a;
		void number(int a,int b){
		a=a;
		a=b;
		System.out.println("Local Variable a = "+a);
		System.out.println("Instance Variable a = "+this.a);
		}
	public static void main(String[] args) {
		ThisKey e=new ThisKey();
		e.number(2,3);

    }
}
